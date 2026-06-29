import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { IMPACT_SITE, ASTEROID_ORIGIN, EARTH_RADIUS_UNITS } from '@/data/ScenarioData';
import { geoToWorld, smoothstep, clamp } from '@/lib/geo';
import { simClock } from '@/lib/simClock';

/**
 * AsteroidTrajectory
 * ----------------------------------------------------------------------------
 * A realistic rocky asteroid travels from a deep-space position toward the
 * impact site during the "approach" phase (tMin from SIM_START_MIN to 0). It
 * fades in, accelerates, and leaves a luminous plasma trail. On impact it is
 * hidden (replaced by the ImpactEffect flash).
 *
 * The asteroid body is a noise-displaced icosahedron (irregular rocky surface)
 * with a PBR standard material, plus an incandescent heated leading edge.
 * ----------------------------------------------------------------------------
 */

// Deep-space start: a point far outside the globe, in the direction of ASTEROID_ORIGIN.
function getStartPos(): THREE.Vector3 {
  const dir = geoToWorld(ASTEROID_ORIGIN.lon, ASTEROID_ORIGIN.lat, 1).normalize();
  return dir.multiplyScalar(EARTH_RADIUS_UNITS + 7);
}

const APPROACH_START = -5; // minutes (SIM_START_MIN)
const APPROACH_END = 0; // minutes (impact)

/** Simple deterministic 3D noise (hash-based) for rocky surface displacement. */
function hash3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const c000 = hash3(xi, yi, zi);
  const c100 = hash3(xi + 1, yi, zi);
  const c010 = hash3(xi, yi + 1, zi);
  const c110 = hash3(xi + 1, yi + 1, zi);
  const c001 = hash3(xi, yi, zi + 1);
  const c101 = hash3(xi + 1, yi, zi + 1);
  const c011 = hash3(xi, yi + 1, zi + 1);
  const c111 = hash3(xi + 1, yi + 1, zi + 1);
  const x00 = c000 * (1 - u) + c100 * u;
  const x10 = c010 * (1 - u) + c110 * u;
  const x01 = c001 * (1 - u) + c101 * u;
  const x11 = c011 * (1 - u) + c111 * u;
  const y0 = x00 * (1 - v) + x10 * v;
  const y1 = x01 * (1 - v) + x11 * v;
  return y0 * (1 - w) + y1 * w;
}
/** Fractal Brownian Motion — layered noise for a natural rocky surface. */
function fbm(x: number, y: number, z: number, octaves = 4): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise3(x * freq, y * freq, z * freq);
    freq *= 2.1;
    amp *= 0.5;
  }
  return value;
}

export function AsteroidTrajectory({ visible }: { visible: boolean }) {
  const rockRef = useRef<THREE.Mesh>(null);
  const rockMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const glowMatRef = useRef<THREE.SpriteMaterial>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const trailMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const startPos = useMemo(getStartPos, []);
  const impactPos = useMemo(
    () => geoToWorld(IMPACT_SITE.lon, IMPACT_SITE.lat, EARTH_RADIUS_UNITS, 0.05),
    [],
  );

  // ---- Rocky asteroid geometry: noise-displaced icosahedron ----
  const rockGeom = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.06, 4); // high subdivision
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      // multi-octave displacement along the normal for craggy surface
      const d = 0.75 + 0.4 * fbm(n.x * 4 + 10, n.y * 4 + 20, n.z * 4 + 30, 4);
      v.copy(n).multiplyScalar(0.06 * d);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    return geo;
  }, []);

  // ---- Plasma glow sprite ----
  const glowTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,220,150,0.9)');
    g.addColorStop(0.6, 'rgba(255,120,50,0.35)');
    g.addColorStop(1, 'rgba(255,80,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  // ---- Trail: thin tapered cylinder re-oriented each frame ----
  const trailGeom = useMemo(() => new THREE.CylinderGeometry(0.014, 0.001, 1, 12, 1, true), []);

  useFrame(() => {
    const t = simClock.value;
    if (!visible || t >= APPROACH_END) {
      if (rockRef.current) rockRef.current.visible = false;
      if (glowRef.current) glowRef.current.visible = false;
      if (trailRef.current) trailRef.current.visible = false;
      return;
    }

    // progress 0..1 across the approach window, with acceleration (ease-in)
    const raw = clamp((t - APPROACH_START) / (APPROACH_END - APPROACH_START), 0, 1);
    const eased = raw * raw; // accelerating approach

    // quadratic bezier path
    const mid = startPos.clone().lerp(impactPos, 0.5).multiplyScalar(1.12);
    const cur = new THREE.Vector3();
    const a = startPos.clone().lerp(mid, eased);
    const b = mid.clone().lerp(impactPos, eased);
    cur.copy(a).lerp(b, eased);

    if (rockRef.current) {
      rockRef.current.visible = true;
      rockRef.current.position.copy(cur);
      rockRef.current.rotation.x += 0.05;
      rockRef.current.rotation.y += 0.03;
      const fade = smoothstep(APPROACH_START, APPROACH_START + 0.6, t);
      rockRef.current.scale.setScalar(0.5 + 0.5 * fade + eased * 0.6);
      // heat up as it approaches
      if (rockMatRef.current) rockMatRef.current.emissiveIntensity = 0.8 + eased * 4;
    }

    if (glowRef.current && glowMatRef.current) {
      glowRef.current.visible = true;
      glowRef.current.position.copy(cur);
      const s = 0.14 + eased * 0.5;
      glowRef.current.scale.set(s, s, s);
      glowMatRef.current.opacity = 0.5 + 0.5 * eased;
    }

    // Trail: stretch a cylinder from current pos back along velocity direction.
    if (trailRef.current && trailMatRef.current) {
      trailRef.current.visible = true;
      const back = cur.clone().lerp(startPos, 0.08 + 0.05 * eased);
      const midPoint = cur.clone().lerp(back, 0.5);
      const len = cur.distanceTo(back);
      trailRef.current.position.copy(midPoint);
      const dir = back.clone().sub(cur).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
      trailRef.current.quaternion.copy(quat);
      trailRef.current.scale.set(1, len, 1);
      trailMatRef.current.opacity = 0.3 + 0.5 * eased;
    }
  });

  return (
    <group>
      <mesh ref={rockRef} geometry={rockGeom}>
        <meshStandardMaterial
          ref={rockMatRef}
          color="#6b5a48"
          emissive="#ff5a20"
          emissiveIntensity={1}
          roughness={0.92}
          metalness={0.18}
          flatShading
        />
      </mesh>
      <sprite ref={glowRef} scale={[0.14, 0.14, 0.14]}>
        <spriteMaterial
          ref={glowMatRef}
          map={glowTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0}
        />
      </sprite>
      <mesh ref={trailRef} geometry={trailGeom}>
        <meshBasicMaterial
          ref={trailMatRef}
          color="#ffb060"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
