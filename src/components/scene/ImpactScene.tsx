import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, AdaptiveDpr } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Earth } from '@/components/scene/Earth';
import { Stars } from '@/components/scene/Stars';
import { CityLabels } from '@/components/scene/CityLabels';
import { AsteroidTrajectory } from '@/components/scene/AsteroidTrajectory';
import { ImpactEffect } from '@/components/scene/ImpactEffect';
import { WavePropagation } from '@/components/scene/WavePropagation';
import { useSimStore } from '@/state/useSimStore';
import { simClock } from '@/lib/simClock';
import { IMPACT_SITE } from '@/data/ScenarioData';
import { geoToWorld } from '@/lib/geo';

/**
 * ImpactScene
 * ----------------------------------------------------------------------------
 * The R3F Canvas + scene graph. Drives the simClock every frame and eases the
 * camera toward the active preset. OrbitControls is marked makeDefault so the
 * SceneDriver can read & drive its target.
 * ----------------------------------------------------------------------------
 */

const POS_IMPACT = geoToWorld(IMPACT_SITE.lon, IMPACT_SITE.lat, 1).normalize();
const POS_MIAMI = geoToWorld(-80.2, 25.76, 1).normalize();

const CAMERA_PRESETS: Record<string, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
  puertoRico: {
    pos: POS_IMPACT.clone().multiplyScalar(1.9).add(new THREE.Vector3(0.3, 0.4, 0)),
    target: geoToWorld(IMPACT_SITE.lon, IMPACT_SITE.lat, 2, 0),
  },
  caribbeanWide: {
    pos: POS_IMPACT.clone().multiplyScalar(4.2).add(new THREE.Vector3(0.6, 1.0, 0.4)),
    target: geoToWorld(-72, 20, 2, 0),
  },
  miami: {
    pos: POS_MIAMI.clone().multiplyScalar(2.2).add(new THREE.Vector3(0.4, 0.5, 0)),
    target: geoToWorld(-80, 26, 2, 0),
  },
  space: {
    pos: new THREE.Vector3(0, 1.5, 6.5),
    target: geoToWorld(-70, 22, 2, 0),
  },
};

type ControlsLike = { target: THREE.Vector3; update: () => void };

/** Advances the clock and eases the camera toward the active preset. */
function SceneDriver() {
  const cameraMode = useSimStore((s) => s.cameraMode);
  const { camera, controls } = useThree((s) => ({
    camera: s.camera,
    controls: s.controls as unknown as ControlsLike | null,
  }));

  const desiredPos = useRef(new THREE.Vector3().copy(camera.position));
  const desiredTarget = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraMode];
    if (preset) {
      desiredPos.current.copy(preset.pos);
      desiredTarget.current.copy(preset.target);
    }
  }, [cameraMode]);

  useFrame((_, dt) => {
    simClock.advance(dt);
    // frame-rate independent lerp factor
    const k = 1 - Math.pow(0.001, dt);
    camera.position.lerp(desiredPos.current, k);
    if (controls) {
      controls.target.lerp(desiredTarget.current, k);
      controls.update();
    }
  });

  return null;
}

export function ImpactScene() {
  const layers = useSimStore((s) => s.layers);
  const satelliteView = layers.satelliteView;
  const quality = useSimStore((s) => s.quality);

  return (
    <Canvas
      camera={{ position: [1.5, 1.6, 4.5], fov: 45, near: 0.01, far: 200 }}
      dpr={[1, quality === 'high' ? 2 : 1.3]}
      gl={{
        antialias: quality === 'high',
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor('#02030a', 1);
        // ACES-friendly color management
        THREE.ColorManagement.enabled = true;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        scene.fog = new THREE.FogExp2('#02030a', 0.012);
      }}
    >
      <AdaptiveDpr pixelated />
      <SceneDriver />

      {/* Realistic solar lighting: warm key "sun" + cool space ambient + soft fill */}
      <ambientLight intensity={0.18} color="#3a4a66" />
      <directionalLight
        position={[6, 3, 4]}
        intensity={3.0}
        color="#fff4e2"
        castShadow={quality === 'high'}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Cool rim from the opposite side (earthshine / space bounce) */}
      <directionalLight position={[-4, -1, -3]} intensity={0.45} color="#4a7ab0" />
      {/* Subtle hemispheric fill for softer terminator */}
      <hemisphereLight args={['#9fc8ff', '#0a1020', 0.35]} />

      <Stars count={quality === 'high' ? 2500 : 1200} />

      <Earth satelliteView={satelliteView} />

      {layers.labels && <CityLabels visible={layers.labels} />}

      {layers.asteroid && <AsteroidTrajectory visible={layers.asteroid} />}

      {layers.impactRadius && <ImpactEffect visible={layers.impactRadius} />}

      {layers.wavefronts && (
        <WavePropagation
          visible={layers.wavefronts}
          segments={quality === 'high' ? 128 : 72}
        />
      )}

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2.4}
        maxDistance={9}
        rotateSpeed={0.45}
        zoomSpeed={0.7}
        enableDamping
        dampingFactor={0.08}
      />

      {quality === 'high' && (
        <EffectComposer>
          <Bloom
            intensity={1.35}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.3}
            mipmapBlur
            radius={0.7}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
