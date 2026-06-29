import { useSimStore } from '@/state/useSimStore';
import { DisclaimerBar } from '@/components/ui/DisclaimerBar';
import { CommandPanel } from '@/components/ui/CommandPanel';
import { TimelineControls } from '@/components/ui/TimelineControls';
import { HeaderOverlay } from '@/components/ui/HeaderOverlay';

/**
 * UIOverlay — all 2D HTML panels layered over the 3D canvas. Respects the
 * per-layer visibility toggles (e.g. hiding the timeline panel).
 */
export function UIOverlay() {
  const layers = useSimStore((s) => s.layers);

  return (
    <>
      <DisclaimerBar />
      <HeaderOverlay />
      <CommandPanel />
      {layers.timeline && <TimelineControls />}
    </>
  );
}
