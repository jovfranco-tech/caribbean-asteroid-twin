import { useT } from '@/hooks/useSim';
import { useLiveTMin } from '@/hooks/useSim';
import { useSimStore } from '@/state/useSimStore';
import { SCENARIO, CITIES } from '@/data/ScenarioData';

/**
 * CommandPanel — fictional scenario telemetry + affected-zone readout.
 * All values are explicitly labeled as visual/cinematic, not scientific.
 */
export function CommandPanel() {
  const t = useT();
  const lang = useSimStore((s) => s.lang);
  const tMin = useLiveTMin();

  const impactEnergy = lang === 'es' ? SCENARIO.energyLabelEs : SCENARIO.energyLabelEn;
  const crater = lang === 'es' ? SCENARIO.craterLabelEs : SCENARIO.craterLabelEn;
  const speed = lang === 'es' ? SCENARIO.propagationSpeedLabelEs : SCENARIO.propagationSpeedLabelEn;
  const peak = lang === 'es' ? SCENARIO.peakWaveLabelEs : SCENARIO.peakWaveLabelEn;
  const confidence = lang === 'es' ? SCENARIO.confidenceEs : SCENARIO.confidenceEn;

  return (
    <div
      className="panel"
      style={{
        position: 'absolute',
        top: 56,
        left: 12,
        width: 290,
        maxHeight: 'calc(100vh - 180px)',
        overflowY: 'auto',
        padding: 14,
        zIndex: 20,
      }}
    >
      <h2 className="panel-title">{t('cmdCenter')}</h2>

      <div style={{ marginBottom: 6 }}>
        <div className="label" style={{ marginBottom: 2 }}>
          {t('scenario')}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--accent)',
            letterSpacing: '0.08em',
          }}
        >
          {SCENARIO.id}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 9, marginTop: 12 }}>
        <Telemetry label={t('impactEnergy')} value={impactEnergy} unit={t('energyUnit')} />
        <Telemetry label={t('crater')} value={crater} />
        <Telemetry label={t('propagation')} value={speed} />
        <Telemetry label={t('peakWave')} value={peak} />
      </div>

      {/* Affected zones */}
      <div style={{ marginTop: 16 }}>
        <div className="label" style={{ marginBottom: 6 }}>
          {t('affectedZones')}
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          {CITIES.map((c) => {
            const arrived = tMin >= c.arrivalMin;
            const name = lang === 'es' ? c.es : c.en;
            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 6px',
                  background: arrived
                    ? 'rgba(255, 90, 60, 0.08)'
                    : 'rgba(110, 231, 255, 0.03)',
                  border: `1px solid ${
                    arrived ? 'rgba(255, 90, 60, 0.3)' : 'rgba(110, 231, 255, 0.08)'
                  }`,
                  borderRadius: 3,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: arrived ? '#ff8a5c' : 'var(--text)',
                  }}
                >
                  {name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    color: arrived ? '#ff8a5c' : 'var(--text-faint)',
                  }}
                >
                  {arrived
                    ? `T+${c.arrivalMin}m · ${t('arrArrival')}`
                    : `${c.distanceKm}km · ${t('arrPending')}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confidence */}
      <div
        style={{
          marginTop: 14,
          padding: '8px 10px',
          background: 'rgba(255, 184, 77, 0.07)',
          border: '1px solid rgba(255, 184, 77, 0.25)',
          borderRadius: 4,
        }}
      >
        <div className="label" style={{ marginBottom: 3, color: 'var(--warn)' }}>
          {t('confidence')}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#ffd9a0',
            lineHeight: 1.4,
          }}
        >
          {confidence}
        </div>
      </div>
    </div>
  );
}

function Telemetry({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 2 }}>
        {label}
      </div>
      <div className="value warn" style={{ textAlign: 'left' }}>
        {value}
        {unit && (
          <span style={{ color: 'var(--text-faint)', marginLeft: 4, fontSize: 9 }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
