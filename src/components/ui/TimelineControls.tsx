import { useT, useIsPlaying, useSpeed, useLiveTMin } from '@/hooks/useSim';
import { useSimStore, type CameraMode } from '@/state/useSimStore';
import { simClock } from '@/lib/simClock';
import {
  PHASES,
  SIM_START_MIN,
  SIM_END_MIN,
  SCENARIO,
} from '@/data/ScenarioData';

const SPEEDS = [1, 5, 20];
const CAMERAS: { id: CameraMode; key: 'camPuertoRico' | 'camCaribbean' | 'camMiami' | 'camSpace' }[] = [
  { id: 'puertoRico', key: 'camPuertoRico' },
  { id: 'caribbeanWide', key: 'camCaribbean' },
  { id: 'miami', key: 'camMiami' },
  { id: 'space', key: 'camSpace' },
];

/**
 * TimelineControls — play/pause/reset, speed, camera modes, layer toggles, and
 * the animated phase timeline with a scrubbable progress bar.
 */
export function TimelineControls() {
  const t = useT();
  const playing = useIsPlaying();
  const speed = useSpeed();
  const tMin = useLiveTMin();
  const lang = useSimStore((s) => s.lang);
  const cameraMode = useSimStore((s) => s.cameraMode);
  const setCameraMode = useSimStore((s) => s.setCameraMode);
  const layers = useSimStore((s) => s.layers);
  const toggleLayer = useSimStore((s) => s.toggleLayer);

  const range = SIM_END_MIN - SIM_START_MIN;
  const progress = ((tMin - SIM_START_MIN) / range) * 100;

  // Current status
  let statusKey:
    | 'statusStandby'
    | 'statusApproach'
    | 'statusImpact'
    | 'statusPropagating'
    | 'statusArrived' = 'statusStandby';
  if (tMin < 0) statusKey = 'statusApproach';
  else if (tMin < 0.3) statusKey = 'statusImpact';
  else if (tMin < 150) statusKey = 'statusPropagating';
  else statusKey = 'statusArrived';

  const statusColor =
    statusKey === 'statusImpact'
      ? '#ff5a3c'
      : statusKey === 'statusArrived'
        ? '#4ade80'
        : statusKey === 'statusApproach'
          ? '#ffb84d'
          : '#6ee7ff';

  return (
    <div
      className="panel"
      style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(860px, 95vw)',
        padding: 14,
        zIndex: 20,
      }}
    >
      {/* Status + sim time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 10px ${statusColor}`,
              animation: playing ? 'pulse-dot 1.1s ease-in-out infinite' : 'none',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.14em',
              color: statusColor,
              textTransform: 'uppercase',
            }}
          >
            {t(statusKey)}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>
          {t('simTime')}: <span style={{ color: '#eaf9ff' }}>{formatT(tMin)}</span>
        </div>
      </div>

      {/* Timeline bar with phase markers */}
      <div
        style={{
          position: 'relative',
          height: 38,
          marginBottom: 12,
          cursor: 'pointer',
        }}
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const target = SIM_START_MIN + x * range;
          simClock.seek(target);
        }}
      >
        {/* Track */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 0,
            right: 0,
            height: 4,
            background: 'rgba(110, 231, 255, 0.12)',
            borderRadius: 2,
          }}
        >
          {/* Filled */}
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ffb84d, #ff5a3c 60%, #6ee7ff)',
              borderRadius: 2,
              boxShadow: '0 0 8px rgba(255,140,80,0.5)',
            }}
          />
        </div>
        {/* Phase ticks */}
        {PHASES.map((p) => {
          const left = ((p.tMin - SIM_START_MIN) / range) * 100;
          const isPast = tMin >= p.tMin;
          return (
            <div
              key={p.tMin}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: 8,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isPast ? '#ff8a5c' : 'var(--bg-panel-solid)',
                  border: `1px solid ${isPast ? '#ff8a5c' : 'var(--border-strong)'}`,
                  boxShadow: isPast ? '0 0 8px rgba(255,138,92,0.7)' : 'none',
                }}
              />
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  letterSpacing: '0.08em',
                  color: isPast ? '#ffce9e' : 'var(--text-faint)',
                  whiteSpace: 'nowrap',
                  transform: 'translateX(-30%)',
                }}
              >
                {formatT(p.tMin)}
              </div>
            </div>
          );
        })}
        {/* Playhead */}
        <div
          style={{
            position: 'absolute',
            left: `${progress}%`,
            top: 4,
            transform: 'translateX(-50%)',
            width: 2,
            height: 24,
            background: '#eaf9ff',
            boxShadow: '0 0 8px #fff',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Transport controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => simClock.toggle()}
          style={{ minWidth: 78, fontWeight: 'bold' }}
        >
          {playing ? `⏸ ${t('pause')}` : `▶ ${t('play')}`}
        </button>
        <button onClick={() => simClock.reset()}>↺ {t('reset')}</button>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span className="label" style={{ marginRight: 2 }}>
            {t('speed')}
          </span>
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={speed === s ? 'active' : ''}
              onClick={() => {
                simClock.setSpeed(s);
                useSimStore.getState().setSpeed(s);
              }}
              style={{ minWidth: 38 }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Cameras + Layers row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="label">{t('camera')}</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {CAMERAS.map((c) => (
              <button
                key={c.id}
                className={cameraMode === c.id ? 'active' : ''}
                onClick={() => setCameraMode(c.id)}
              >
                {t(c.key)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="label">{t('layers')}</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(
              [
                ['wavefronts', 'lyWavefronts'],
                ['labels', 'lyLabels'],
                ['impactRadius', 'lyImpactRadius'],
                ['asteroid', 'lyAsteroid'],
                ['timeline', 'lyTimeline'],
                ['satelliteView', 'lySatellite'],
              ] as const
            ).map(([k, labelKey]) => (
              <button
                key={k}
                className={layers[k] ? 'active' : ''}
                onClick={() => toggleLayer(k)}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Caption: current phase description */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-dim)',
          letterSpacing: '0.06em',
        }}
      >
        {(() => {
          let active = PHASES[0];
          for (const p of PHASES) if (tMin >= p.tMin) active = p;
          const desc = lang === 'es' ? active.es : active.en;
          return desc;
        })()}
        <span style={{ marginLeft: 8, color: 'var(--text-faint)' }}>
          · {lang === 'es' ? SCENARIO.confidenceEs : SCENARIO.confidenceEn}
        </span>
      </div>
    </div>
  );
}

function formatT(min: number): string {
  if (min >= 0) return `T+${min.toFixed(0).padStart(3, '0')}m`;
  return `T-${Math.abs(min).toFixed(0).padStart(2, '0')}m`;
}
