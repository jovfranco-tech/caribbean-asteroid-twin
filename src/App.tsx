import { useEffect } from 'react';
import { ImpactScene } from '@/components/scene/ImpactScene';
import { UIOverlay } from '@/components/ui/UIOverlay';
import { useSimClockBridge } from '@/hooks/useSim';
import { simClock } from '@/lib/simClock';
import '@/styles/App.css';

/**
 * App — root layout. Renders the full-bleed 3D scene with the HTML command
 * overlay on top. Boots the clock bridge and auto-starts playback.
 */
export default function App() {
  useSimClockBridge();

  useEffect(() => {
    // Auto-play after a short beat so the user lands into the approach phase.
    const id = setTimeout(() => simClock.play(), 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="app-root">
      <div className="scene-wrap">
        <ImpactScene />
      </div>
      <UIOverlay />
    </div>
  );
}
