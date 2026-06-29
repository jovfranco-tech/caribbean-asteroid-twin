import { useT } from '@/hooks/useSim';

/**
 * DisclaimerBar — always-visible fictional-scenario notice.
 * Rendered prominently at the top so the visualization can never be mistaken
 * for a real forecast or emergency tool.
 */
export function DisclaimerBar() {
  const t = useT();
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        maxWidth: 'min(680px, 92vw)',
        padding: '6px 14px',
        background: 'rgba(60, 12, 8, 0.85)',
        border: '1px solid rgba(255, 90, 60, 0.5)',
        borderRadius: 5,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        textAlign: 'center',
        boxShadow: '0 0 18px rgba(255, 90, 60, 0.2)',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.14em',
          color: '#ffb4a0',
          lineHeight: 1.4,
          display: 'block',
        }}
      >
        ⚠ {t('disclaimer')}
      </span>
    </div>
  );
}
