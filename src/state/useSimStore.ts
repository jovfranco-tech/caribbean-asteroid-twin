import { create } from 'zustand';

export type CameraMode = 'puertoRico' | 'caribbeanWide' | 'miami' | 'space';
export type Lang = 'en' | 'es';

export interface LayerState {
  wavefronts: boolean;
  labels: boolean;
  impactRadius: boolean;
  timeline: boolean;
  satelliteView: boolean;
  asteroid: boolean;
}

export interface SimStore {
  // Settings
  lang: Lang;
  cameraMode: CameraMode;
  layers: LayerState;
  quality: 'high' | 'low'; // bloom + rings segments

  // Live mirror of simClock (updated ~8Hz)
  playing: boolean;
  speed: number;
  tMin: number;

  // Actions
  setLang: (l: Lang) => void;
  setCameraMode: (c: CameraMode) => void;
  toggleLayer: (k: keyof LayerState) => void;
  setQuality: (q: 'high' | 'low') => void;
  setPlaying: (p: boolean) => void;
  setSpeed: (s: number) => void;
  setTMin: (t: number) => void;
}

export const useSimStore = create<SimStore>((set) => ({
  lang: 'en',
  cameraMode: 'caribbeanWide',
  layers: {
    wavefronts: true,
    labels: true,
    impactRadius: true,
    timeline: true,
    satelliteView: false,
    asteroid: true,
  },
  quality: typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(max-width: 768px)').matches
      ? 'low'
      : 'high'
    : 'high',

  playing: false,
  speed: 1,
  tMin: -5,

  setLang: (lang) => set({ lang }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  toggleLayer: (k) =>
    set((s) => ({ layers: { ...s.layers, [k]: !s.layers[k] } })),
  setQuality: (quality) => set({ quality }),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
  setTMin: (tMin) => set({ tMin }),
}));
