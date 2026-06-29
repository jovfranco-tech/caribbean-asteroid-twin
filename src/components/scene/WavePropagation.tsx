import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { IMPACT_SITE, WAVE_RINGS } from '@/data/ScenarioData';
import { geodesicRing, smoothstep, clamp } from '@/lib/geo';
import { simClock } from '@/lib/simClock';

/**
 * WavePropagation
 * ----------------------------------------------------------------------------
 * Three concentric, expanding geodesic rings radiate from the impact site.
 * Each ring:
 *   - spawns at t=0,
 *   - grows from 0 to maxRadiusKm over `lifespanMin`,
 *   - fades as it approaches its max radius.
 *
 * Rings are rebuilt each frame from the destination-point formula so they
 * follow the globe's curvature (not flat screen-space circles).
 * ----------------------------------------------------------------------------
 */
export function WavePropagation({ visible, segments = 128 }: { visible: boolean; segments?: number }) {
  // Pre-create one THREE.Line per ring; we mutate geometry each frame.
  const rings = useMemo(() => {
    return WAVE_RINGS.map((r) => {
      const pts = geodesicRing(IMPACT_SITE, 1, segments, 0.006);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(r.colorHex),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(geo, mat);
      return { line, geo, mat, ...r };
    });
  }, [segments]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = simClock.value; // minutes
    if (!visible || t < 0) {
      for (const r of rings) r.line.visible = false;
      return;
    }
    for (const r of rings) {
      const progress = clamp(t / r.lifespanMin, 0, 1);
      const radiusKm = r.maxRadiusKm * progress;
      if (progress <= 0 || progress >= 1) {
        r.line.visible = progress > 0 && progress < 1;
        // keep fading tail just past lifespan
        if (progress >= 1) {
          const fade = 1 - smoothstep(1, 1.15, t / r.lifespanMin);
          r.mat.opacity = fade * 0.5;
          r.line.visible = fade > 0.02;
        }
      }
      if (radiusKm < 2) {
        r.line.visible = false;
        continue;
      }
      r.line.visible = true;
      const pts = geodesicRing(IMPACT_SITE, radiusKm, segments, 0.006);
      const posArr = r.geo.getAttribute('position') as THREE.BufferAttribute;
      const n = Math.min(pts.length, posArr.count);
      for (let i = 0; i < n; i++) {
        posArr.setXYZ(i, pts[i].x, pts[i].y, pts[i].z);
      }
      posArr.needsUpdate = true;
      r.geo.computeBoundingSphere();
      // Opacity: bright at leading edge, fades near max radius.
      r.mat.opacity = (1 - smoothstep(0.6, 1.0, progress)) * 0.9;
    }
  });

  // Cleanup on unmount
  useMemo(() => {
    return () => {
      for (const r of rings) {
        r.geo.dispose();
        r.mat.dispose();
      }
    };
  }, [rings]);

  return (
    <group ref={groupRef}>
      {rings.map((r, i) => (
        <primitive key={i} object={r.line} />
      ))}
    </group>
  );
}
