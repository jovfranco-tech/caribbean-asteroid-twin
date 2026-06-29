import { useSimStore } from '@/state/useSimStore';
import { useT, useLiveTMin } from '@/hooks/useSim';

/**
 * HeaderOverlay — title, subtitle, language toggle, and quick legend.
 * Sits top-right on desktop; the DisclaimerBar occupies the top-center.
 */
export function HeaderOverlay() {
  const t = useT();
  const lang = useSimStore((s) => s.lang);
  const setLang = useSimStore((s) => s.setLang);
  const tMin = useLiveTMin();

  const phaseLabel = (() => {
    // brief phase tag
    if (tMin < 0) return lang === 'es' ? 'FASE: APROXIMACIÓN' : 'PHASE: APPROACH';
    if (tMin < 0.3) return lang === 'es' ? 'FASE: IMPACTO' : 'PHASE: IMPACT';
    if (tMin < 150) return lang === 'es' ? 'FASE: PROPAGACIÓN' : 'PHASE: PROPAGATION';
    return lang === 'es' ? 'FASE: ARRIBO MIAMI' : 'PHASE: MIAMI ARRIVAL';
  })();

  return (
    <>
      {/* Title block (top-right) */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          zIndex: 25,
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 4,
        }}
      >
        <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')} style={{ marginBottom: 2 }}>
          {t('langToggle')}
        </button>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            letterSpacing: '0.18em',
            color: 'var(--accent)',
            textShadow: 'var(--glow-cyan)',
            fontWeight: 'bold',
          }}
        >
          {t('title')}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.16em',
            color: 'var(--text-dim)',
          }}
        >
          {t('subtitle')}
        </div>
      </div>

      {/* Phase + help (bottom-left) */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 25,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.12em',
          color: 'var(--text-faint)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          pointerEvents: 'none',
        }}
      >
        <div style={{ color: 'var(--accent)' }}>{phaseLabel}</div>
        <div>{t('helpTip')}</div>
        <div>{t('disclaimerShort')}</div>
      </div>

      {/* Legend (top-left, below disclaimer) */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          right: 12,
          zIndex: 20,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.1em',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          pointerEvents: 'none',
        }}
      >
        <div style={{ color: 'var(--accent)', marginBottom: 2 }}>{t('legend')}</div>
        <LegendRow color="#ff5a3c" label={lang === 'es' ? 'Onda cercana' : 'Near wave'} />
        <LegendRow color="#ffb84d" label={lang === 'es' ? 'Onda media' : 'Mid wave'} />
        <LegendRow color="#36c5ff" label={lang === 'es' ? 'Onda lejana' : 'Far wave'} />
      </div>
    </>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 18,
          height: 2,
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      <span>{label}</span>
    </div>
  );
}
