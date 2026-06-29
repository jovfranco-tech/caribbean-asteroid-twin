import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { EARTH_RADIUS_UNITS } from '@/data/ScenarioData';

interface EarthProps {
  satelliteView: boolean;
}

/**
 * Realistic Earth
 * ----------------------------------------------------------------------------
 * PBR-textured globe using NASA Blue Marble textures:
 *   - Day map (albedo) — surface color
 *   - Normal map — fine terrain relief (mountains, ridges catch the light)
 *   - Specular map — oceans are shiny, land is matte
 *   - Animated cloud layer slightly above the surface
 *   - Rayleigh-style atmosphere scattering shader
 *
 * Textures are bundled locally under public/textures/ (no runtime CDN).
 * ----------------------------------------------------------------------------
 */
export function Earth({ satelliteView }: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const [dayMap, normalMap, specularMap, cloudsMap] = useLoader(
    TextureLoader,
    [
      'textures/earth_day.jpg',
      'textures/earth_normal.jpg',
      'textures/earth_specular.jpg',
      'textures/earth_clouds.png',
    ],
  );

  // Configure textures for proper color & filtering
  useMemo(() => {
    [dayMap, cloudsMap].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.wrapS = THREE.RepeatWrapping;
    });
    // Data textures: normal & specular are non-color
    [normalMap, specularMap].forEach((t) => {
      t.colorSpace = THREE.NoColorSpace;
      t.anisotropy = 8;
      t.wrapS = THREE.RepeatWrapping;
    });
  }, [dayMap, normalMap, specularMap, cloudsMap]);

  useFrame((_, dt) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += dt * 0.008;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += dt * 0.012; // clouds drift slightly faster
    }
  });

  return (
    <group>
      {/* ---- Earth surface (PBR) ---- */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 128, 128]} />
        <meshPhongMaterial
          map={dayMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.85, 0.85)}
          specularMap={specularMap}
          specular={new THREE.Color('#4a7ab0')}
          shininess={28}
          bumpMap={normalMap}
          bumpScale={0.04}
          emissive={satelliteView ? new THREE.Color('#000000') : new THREE.Color('#020a18')}
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* ---- Cloud layer (animated, double-sided) ---- */}
      <mesh ref={cloudsRef} scale={1.012}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 96, 96]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={THREE.NormalBlending}
          shininess={2}
        />
      </mesh>

      {/* ---- Atmosphere: outer rim glow (Rayleigh-style) ---- */}
      <mesh scale={1.06}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 64, 64]} />
        <shaderMaterial
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            glowColor: { value: new THREE.Color('#5b9bff') },
            power: { value: 2.6 },
          }}
          vertexShader={ATMOS_VERT}
          fragmentShader={ATMOS_FRAG}
        />
      </mesh>

      {/* ---- Inner atmosphere haze (limb brightening on day side) ---- */}
      <mesh scale={1.018}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 64, 64]} />
        <shaderMaterial
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          uniforms={{
            glowColor: { value: new THREE.Color('#9fc8ff') },
          }}
          vertexShader={HAZE_VERT}
          fragmentShader={HAZE_FRAG}
        />
      </mesh>
    </group>
  );
}

// ---- Atmosphere shaders (fresnel rim glow) ----
const ATMOS_VERT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOS_FRAG = /* glsl */ `
  uniform vec3 glowColor;
  uniform float power;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
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
    rim = pow(rim, 2.2);
    gl_FragColor = vec4(glowColor, rim * 0.45);
  }
`;
