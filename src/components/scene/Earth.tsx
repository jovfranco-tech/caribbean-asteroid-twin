import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createEarthTexture } from '@/three/earthTexture';
import { EARTH_RADIUS_UNITS } from '@/data/ScenarioData';

interface EarthProps {
  satelliteView: boolean;
}

/**
 * Stylized globe: textured sphere + a slightly larger back-side "atmosphere"
 * shell with additive fresnel-style rim glow. The globe slowly rotates so the
 * scene feels alive even when paused.
 */
export function Earth({ satelliteView }: EarthProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(
    () => createEarthTexture(satelliteView),
    [satelliteView],
  );

  // Dispose old texture when regenerated (satelliteView toggle)
  useMemo(() => {
    return () => texture.dispose();
  }, [texture]);

  useFrame((_, dt) => {
    if (meshRef.current) {
      // very slow ambient rotation
      meshRef.current.rotation.y += dt * 0.008;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 96, 96]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.1}
          roughness={0.85}
          emissive={satelliteView ? new THREE.Color('#021018') : new THREE.Color('#04101f')}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Atmosphere rim (additive, renders behind front face) */}
      <mesh scale={1.025}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 64, 64]} />
        <shaderMaterial
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            glowColor: { value: new THREE.Color(satelliteView ? '#5aa0ff' : '#2a6fff') },
          }}
          vertexShader={ATMOS_VERT}
          fragmentShader={ATMOS_FRAG}
        />
      </mesh>

      {/* Inner haze (front side, faint) */}
      <mesh scale={1.004}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 64, 64]} />
        <shaderMaterial
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          uniforms={{
            glowColor: { value: new THREE.Color('#8fd6ff') },
          }}
          vertexShader={HAZE_VERT}
          fragmentShader={HAZE_FRAG}
        />
      </mesh>
    </group>
  );
}

const ATMOS_VERT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOS_FRAG = /* glsl */ `
  uniform vec3 glowColor;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(glowColor, 1.0) * intensity;
  }
`;

const HAZE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const HAZE_FRAG = /* glsl */ `
  uniform vec3 glowColor;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
    rim = pow(rim, 3.0);
    gl_FragColor = vec4(glowColor, rim * 0.35);
  }
`;
