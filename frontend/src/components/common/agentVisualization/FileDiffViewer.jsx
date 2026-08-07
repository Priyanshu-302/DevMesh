export default function FileDiffViewer({ logs = [] }) {
  const diffEntries = (logs || []).reduce((acc, l) => {
    if (!l) return acc;
    // Check if it's a diff entry with a file and diff string
    if (l.diff) {
      acc.push({ file: l.file || 'Modified File', diffText: l.diff });
      return acc;
    }
    const text = l.text || l.message || '';
    if (l.agent === 'developer' && (text.startsWith('+') || text.startsWith('-') || text.startsWith(' '))) {
      acc.push({ file: l.file || 'src/auth/session.ts', diffText: text });
    }
    return acc;
  }, []);

  if (diffEntries.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 12 }}>
          File Diff
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
          No code changes yet…
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 12 }}>
        File Diff
      </div>
      <div style={{ maxHeight: 280, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8 }}>
        {diffEntries.map((entry, idx) => (
          <div key={idx} style={{ marginBottom: 10 }}>
            {entry.file && (
              <div style={{ color: 'var(--orange)', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>
                📄 {entry.file}
              </div>
            )}
            {entry.diffText.split('\n').map((line, lineIdx) => {
              const bg = line.startsWith('+') ? 'rgba(0,255,65,0.12)' : line.startsWith('-') ? 'rgba(255,68,68,0.1)' : 'transparent';
              const color = line.startsWith('+') ? '#00ff41' : line.startsWith('-') ? '#ff4444' : 'var(--muted)';
              return (
                <div key={lineIdx} style={{ background: bg, padding: '1px 8px', borderRadius: 2, color, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {line}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

