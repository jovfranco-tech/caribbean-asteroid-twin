import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CITIES, IMPACT_SITE } from '@/data/ScenarioData';
import { geoToWorld, smoothstep } from '@/lib/geo';
import { createGlowTexture } from '@/three/earthTexture';
import { simClock } from '@/lib/simClock';
import { useSimStore } from '@/state/useSimStore';

interface CityLabelsProps {
  visible: boolean;
}

/**
 * Luminous markers + HTML labels for each city. A city's marker brightens and
 * the label turns "alert" color once the stylized wavefront has arrived there
 * (tMin >= city.arrivalMin).
 */
export function CityLabels({ visible }: CityLabelsProps) {
  const glowTex = useMemo(() => createGlowTexture('rgba(150,225,255,1)'), []);
  const arrivedTex = useMemo(
    () => createGlowTexture('rgba(255,120,70,1)', 'rgba(255,80,40,0)'),
    [],
  );
  const impactTex = useMemo(
    () => createGlowTexture('rgba(255,200,90,1)', 'rgba(255,120,0,0)'),
    [],
  );

  if (!visible) return null;

  return (
    <group>
      {/* Impact site marker */}
      <CityMarker
        point={IMPACT_SITE}
        label="IMPACT"
        sublabel="18.6°N 66.6°W"
        texture={impactTex}
        color="#ffcc55"
        arrivedAt={0}
        alwaysAlert
      />
      {CITIES.map((c) => (
        <CityMarkerLazy
          key={c.id}
          point={c}
          labelKey={c.id}
          glowTex={glowTex}
          arrivedTex={arrivedTex}
        />
      ))}
    </group>
  );
}

interface MarkerProps {
  point: { lon: number; lat: number; en?: string; es?: string };
  label: string;
  sublabel?: string;
  texture: THREE.Texture;
  color: string;
  arrivedAt: number;
  alwaysAlert?: boolean;
}

function CityMarker({ point, label, sublabel, texture, color, arrivedAt, alwaysAlert }: MarkerProps) {
  const lang = useSimStore((s) => s.lang);
  const tMin = useSimStore((s) => s.tMin);
  const pos = useMemo(
    () => geoToWorld(point.lon, point.lat, undefined, 0.01),
    [point.lon, point.lat],
  );
  const arrived = alwaysAlert || tMin >= arrivedAt;
  const labelText = point.en && point.es ? (lang === 'es' ? point.es : point.en) : label;

  return (
    <group position={pos}>
      <sprite scale={[0.12, 0.12, 0.12]}>
        <spriteMaterial map={texture} transparent depthWrite={false} />
      </sprite>
      <Html
        position={[0, 0.06, 0]}
        center
        distanceFactor={6}
        zIndexRange={[20, 0]}
        occlude
      >
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11,
            letterSpacing: '0.12em',
            color: arrived ? '#ff8a5c' : '#cfeeff',
            textShadow: arrived
              ? '0 0 8px rgba(255,120,70,0.9)'
              : '0 0 6px rgba(80,180,255,0.6)',
            whiteSpace: 'nowrap',
            borderLeft: `2px solid ${arrived ? '#ff8a5c' : color}`,
            paddingLeft: 6,
            transform: 'translateY(-50%)',
          }}
        >
          {labelText?.toUpperCase()}
          {sublabel && (
            <div style={{ fontSize: 8, opacity: 0.6, letterSpacing: '0.18em' }}>
              {sublabel}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

/** City marker driven directly by the clock (no React re-render per frame). */
function CityMarkerLazy({
  point,
  labelKey,
  glowTex,
  arrivedTex,
}: {
  point: { lon: number; lat: number; en: string; es: string; arrivalMin: number };
  labelKey: string;
  glowTex: THREE.Texture;
  arrivedTex: THREE.Texture;
}) {
  const lang = useSimStore((s) => s.lang);
  const spriteRef = useRef<THREE.Sprite>(null);
  const matRef = useRef<THREE.SpriteMaterial>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const pos = useMemo(
    () => geoToWorld(point.lon, point.lat, undefined, 0.012),
    [point.lon, point.lat],
  );

  const name = lang === 'es' ? point.es : point.en;

  // Per-frame clock check (imperative, cheap)
  useFrame(() => {
    const tMin = simClock.value;
    const arrived = tMin >= point.arrivalMin;
    // ease brightness near arrival
    const k = smoothstep(point.arrivalMin - 1.5, point.arrivalMin + 0.5, tMin);
    if (matRef.current) {
      matRef.current.map = arrived ? arrivedTex : glowTex;
      matRef.current.opacity = 0.5 + 0.5 * k;
    }
    if (spriteRef.current) {
      const s = 0.1 + 0.06 * k;
      spriteRef.current.scale.set(s, s, s);
    }
    if (labelRef.current) {
      const arrivedNow = arrived;
      labelRef.current.style.color = arrivedNow ? '#ff8a5c' : '#cfeeff';
      labelRef.current.style.textShadow = arrivedNow
        ? '0 0 8px rgba(255,120,70,0.9)'
        : '0 0 6px rgba(80,180,255,0.6)';
      labelRef.current.style.borderLeftColor = arrivedNow ? '#ff8a5c' : '#6ee7ff';
    }
  });

  return (
    <group position={pos}>
      <sprite ref={spriteRef} scale={[0.1, 0.1, 0.1]}>
        <spriteMaterial ref={matRef} map={glowTex} transparent depthWrite={false} />
      </sprite>
      <Html position={[0, 0.06, 0]} center distanceFactor={6} zIndexRange={[20, 0]} occlude>
        <div
          ref={labelRef}
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11,
            letterSpacing: '0.12em',
            color: '#cfeeff',
            whiteSpace: 'nowrap',
            borderLeft: '2px solid #6ee7ff',
            paddingLeft: 6,
            transform: 'translateY(-50%)',
          }}
        >
          {name.toUpperCase()}
        </div>
      </Html>
      {/* keeps labelKey referenced for clarity in devtools */}
      <group userData={{ cityId: labelKey }} />
    </group>
  );
}
