export default function QaResultPanel({ qaResult }) {
  if (!qaResult) {
    return (
      <div className="glass-panel" style={{ padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 12 }}>
          QA Audit Report
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
          Awaiting agent inspection and codebase verification…
        </p>
      </div>
    );
  }

  const passed = qaResult.passed;
  const feedbackText = qaResult.feedback || qaResult.details || '';

  return (
    <div className="glass-panel" style={{ padding: 20, borderTop: `3px solid ${passed ? 'var(--green)' : 'var(--red)'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)' }}>
          QA Audit Report
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          color: passed ? 'var(--green)' : 'var(--red)',
          border: `1px solid ${passed ? 'var(--green)' : 'var(--red)'}44`,
          padding: '2px 8px',
          borderRadius: 2,
          background: passed ? 'rgba(0, 255, 65, 0.04)' : 'rgba(255, 68, 68, 0.04)'
        }}>
          {passed ? 'Audit: Passed' : 'Audit: Failed'}
        </span>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--steel)', lineHeight: 1.8 }}>
        {feedbackText ? (
          <div style={{ background: 'rgba(10, 10, 14, 0.5)', padding: '12px 16px', borderRadius: 4, border: '1px solid var(--panel-border)', whiteSpace: 'pre-wrap' }}>
            {feedbackText}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No audit summary available.</p>
        )}
      </div>
    </div>
  );
}
