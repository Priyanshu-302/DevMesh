export default function QaResultPanel({ qaResult }) {
  if (!qaResult) {
    return (
      <div className="glass-panel" style={{ padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 12 }}>
          QA Results
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
          Awaiting QA inspection…
        </p>
      </div>
    );
  }

  const passed = qaResult.passed;

  return (
    <div className="glass-panel" style={{ padding: 20, borderTop: `3px solid ${passed ? 'var(--green)' : 'var(--red)'}` }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 14 }}>
        QA Results
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{passed ? '✅' : '❌'}</span>
        <div>
          <div className="font-display" style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', color: passed ? 'var(--green)' : 'var(--red)' }}>
            {passed ? 'All Checks Passed' : 'Checks Failed'}
          </div>
          {!passed && qaResult.failed && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {qaResult.failed} test(s) failed
            </div>
          )}
        </div>
      </div>

      {qaResult.details && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--steel)', lineHeight: 1.7, background: 'var(--void-2)', padding: '10px 12px', borderRadius: 3 }}>
          {qaResult.details}
        </div>
      )}
    </div>
  );
}
