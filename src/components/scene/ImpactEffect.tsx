import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { IMPACT_SITE, EARTH_RADIUS_UNITS } from '@/data/ScenarioData';
import { geoToWorld, geodesicRing, smoothstep, clamp } from '@/lib/geo';
import { simClock } from '@/lib/simClock';

/**
 * ImpactEffect
 * ----------------------------------------------------------------------------
 * Cinematic impact sequence tied to the clock (tMin):
 *   - t < 0: hidden
 *   - t = 0: brilliant expanding flash + ground shockwave ring + ejecta glow
 *   - t > 0: persistent glowing crater
 * All purely visual; no physics.
 * ----------------------------------------------------------------------------
 */
export function ImpactEffect({ visible }: { visible: boolean }) {
  const flashRef = useRef<THREE.Sprite>(null);
  const flashMatRef = useRef<THREE.SpriteMaterial>(null);
  const shockLineRef = useRef<THREE.Line>(null);
  const craterRef = useRef<THREE.Mesh>(null);
  const craterMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const ejectaRef = useRef<THREE.Mesh>(null);

  const center = IMPACT_SITE;
  const pos = useMemo(
    () => geoToWorld(center.lon, center.lat, EARTH_RADIUS_UNITS, 0.02),
    [center.lon, center.lat],
  );

  const flashTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,230,170,0.9)');
    g.addColorStop(0.7, 'rgba(255,140,60,0.4)');
    g.addColorStop(1, 'rgba(255,80,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  // Build the shockwave as a real THREE.Line we can mutate each frame.
  const shockObj = useMemo(() => {
    const pts = geodesicRing(center, 5, 96, 0.012);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#ffd27a'),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geo, mat);
  }, [center]);

  const ejectaGeom = useMemo(() => new THREE.CircleGeometry(0.05, 32), []);

  useFrame(() => {
    const t = simClock.value; // minutes
    if (!visible) {
      if (flashRef.current) flashRef.current.visible = false;
      if (shockLineRef.current) shockLineRef.current.visible = false;
      if (ejectaRef.current) ejectaRef.current.visible = false;
      if (craterRef.current) craterRef.current.visible = false;
      return;
    }

    if (t < -0.2) {
      if (flashRef.current) flashRef.current.visible = false;
      if (shockLineRef.current) shockLineRef.current.visible = false;
      if (ejectaRef.current) ejectaRef.current.visible = false;
      if (craterRef.current) craterRef.current.visible = false;
      return;
    }

    // ---- Flash: sharp peak at t=0, fades over ~0.25 min ----
    const flashK = Math.max(0, 1 - smoothstep(0, 0.25, t));
    if (flashRef.current && flashMatRef.current) {
      flashRef.current.visible = true;
      const s = 0.2 + 1.8 * flashK;
      flashRef.current.scale.set(s, s, s);
      flashMatRef.current.opacity = flashK;
    }

    // ---- Shockwave ring: expands rapidly in first ~0.4 min, fades by ~1 min ----
    if (shockLineRef.current) {
      const ringT = clamp(t, 0, 1.0);
      const radiusKm = 5 + 215 * smoothstep(0, 0.4, ringT);
      const pts = geodesicRing(center, radiusKm, 96, 0.012);
      const geo = shockLineRef.current.geometry;
      const posArr = geo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < pts.length; i++) {
        posArr.setXYZ(i, pts[i].x, pts[i].y, pts[i].z);
      }
      posArr.needsUpdate = true;
      geo.computeBoundingSphere();
      shockLineRef.current.visible = t < 1.0;
      (shockLineRef.current.material as THREE.LineBasicMaterial).opacity =
        (1 - smoothstep(0.1, 0.9, ringT)) * 0.9;
    }

    // ---- Ejecta glow: rises & fades in first ~0.6 min ----
    if (ejectaRef.current) {
      const e = smoothstep(0, 0.15, t) * (1 - smoothstep(0.15, 0.6, t));
      ejectaRef.current.visible = e > 0.01;
      ejectaRef.current.scale.setScalar(1 + 8 * smoothstep(0, 0.6, t));
      ejectaRef.current.position.set(pos.x * 1.06, pos.y * 1.06, pos.z * 1.06);
      ejectaRef.current.lookAt(0, 0, 0);
      (ejectaRef.current.material as THREE.MeshBasicMaterial).opacity = e * 0.8;
    }

    // ---- Crater: persistent glowing scar after impact ----
    if (craterRef.current && craterMatRef.current) {
      craterRef.current.visible = t >= 0;
      const k = smoothstep(0, 0.2, t);
      const pulse = 0.6 + 0.4 * Math.sin(t * 6);
      craterMatRef.current.opacity = (0.5 + 0.5 * k) * (0.7 + 0.3 * pulse);
      craterRef.current.scale.setScalar(0.6 + 0.4 * k);
    }
  });

  return (
    <group>
      {/* Flash sprite */}
      <sprite ref={flashRef} position={pos.toArray()} scale={[0.2, 0.2, 0.2]}>
        <spriteMaterial
          ref={flashMatRef}
          map={flashTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0}
        />
      </sprite>

      {/* Shockwave ring (mutable THREE.Line) */}
      <primitive ref={shockLineRef} object={shockObj} />

      {/* Ejecta disk */}
      <mesh ref={ejectaRef} geometry={ejectaGeom} position={pos.toArray()}>
        <meshBasicMaterial
          color="#ff9a4d"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Crater */}
      <mesh ref={craterRef} position={pos.toArray()}>
        <ringGeometry args={[0.015, 0.04, 32]} />
        <meshBasicMaterial
          ref={craterMatRef}
          color="#ff5a2a"
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
