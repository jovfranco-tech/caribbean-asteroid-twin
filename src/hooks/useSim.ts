import { useEffect } from 'react';
import { useSimStore } from '@/state/useSimStore';
import { simClock } from '@/lib/simClock';
import { t as translate, type DictKey } from '@/i18n/dict';

/**
 * Bridges the imperative simClock into React: subscribes once on mount and
 * mirrors tMin into the store at ~8Hz so command-panel UI stays fresh without
 * re-rendering the 3D canvas tree.
 */
export function useSimClockBridge() {
  useEffect(() => {
    const unsub = simClock.subscribe((tMin) => {
      useSimStore.getState().setTMin(tMin);
      // playing/speed are also mirrored when they change in the clock
      useSimStore.setState({ playing: simClock.isPlaying, speed: simClock.speedValue });
    });
    return unsub;
  }, []);
}

/** Translate helper bound to current language. */
export function useT() {
  const lang = useSimStore((s) => s.lang);
  return (key: DictKey) => translate(lang, key);
}

/** Reactive read of simClock's playing/speed/tMin via the store. */
export function useLiveTMin() {
  return useSimStore((s) => s.tMin);
}
export function useIsPlaying() {
  return useSimStore((s) => s.playing);
}
export function useSpeed() {
  return useSimStore((s) => s.speed);
}
