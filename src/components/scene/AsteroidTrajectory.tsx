import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { IMPACT_SITE, ASTEROID_ORIGIN, EARTH_RADIUS_UNITS } from '@/data/ScenarioData';
import { geoToWorld, smoothstep, clamp } from '@/lib/geo';
import { simClock } from '@/lib/simClock';

/**
 * AsteroidTrajectory
 * ----------------------------------------------------------------------------
 * A glowing asteroid travels from a deep-space position toward the impact site
 * during the "approach" phase (tMin from SIM_START_MIN to 0). It fades in,
 * accelerates, and leaves a luminous trail. On impact (t>=0) it is hidden.
 * ----------------------------------------------------------------------------
 */

// Deep-space start: a point far outside the globe, in the direction of ASTEROID_ORIGIN.
function getStartPos(): THREE.Vector3 {
  const dir = geoToWorld(ASTEROID_ORIGIN.lon, ASTEROID_ORIGIN.lat, 1).normalize();
  return dir.multiplyScalar(EARTH_RADIUS_UNITS + 7); // 7 units above surface
}

const APPROACH_START = -5; // minutes (SIM_START_MIN)
const APPROACH_END = 0; // minutes (impact)

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

  // Asteroid body
  const rockGeom = useMemo(() => new THREE.IcosahedronGeometry(0.045, 1), []);

  // Glow sprite
  const glowTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,210,150,0.8)');
    g.addColorStop(0.7, 'rgba(255,120,50,0.3)');
    g.addColorStop(1, 'rgba(255,80,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  // Trail: a thin cylinder we re-orient between current pos and a point behind.
  const trailGeom = useMemo(() => new THREE.CylinderGeometry(0.012, 0.002, 1, 8, 1, true), []);

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

    // Current position along a slightly curved path (quadratic bezier toward impact)
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
      rockRef.current.scale.setScalar(0.5 + 0.5 * fade + eased * 0.5);
      if (rockMatRef.current) rockMatRef.current.emissiveIntensity = 1 + eased * 3;
    }

    if (glowRef.current && glowMatRef.current) {
      glowRef.current.visible = true;
      glowRef.current.position.copy(cur);
      const s = 0.12 + eased * 0.4;
      glowRef.current.scale.set(s, s, s);
      glowMatRef.current.opacity = 0.6 + 0.4 * eased;
    }

    // Trail: stretch a cylinder from current pos back along velocity direction.
    if (trailRef.current && trailMatRef.current) {
      trailRef.current.visible = true;
      const back = cur.clone().lerp(startPos, 0.08 + 0.05 * eased);
      const midPoint = cur.clone().lerp(back, 0.5);
      const len = cur.distanceTo(back);
      trailRef.current.position.copy(midPoint);
      // orient cylinder (default along Y) to the direction
      const dir = back.clone().sub(cur).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
      trailRef.current.quaternion.copy(quat);
      trailRef.current.scale.set(1, len, 1);
      trailMatRef.current.opacity = 0.35 + 0.4 * eased;
    }
  });

  return (
    <group>
      <mesh ref={rockRef} geometry={rockGeom}>
        <meshStandardMaterial
          ref={rockMatRef}
          color="#5a4a3a"
          emissive="#ff7a30"
          emissiveIntensity={1}
          roughness={0.6}
          metalness={0.3}
          flatShading
        />
      </mesh>
      <sprite ref={glowRef} scale={[0.12, 0.12, 0.12]}>
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
