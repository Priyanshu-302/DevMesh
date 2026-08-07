const STATUS_MAP = {
  pending:   { color: '#5a6070', label: 'Pending',   dot: '#5a6070' },
  running:   { color: '#ff6b2b', label: 'Running',   dot: '#ff6b2b' },
  completed: { color: '#00ff41', label: 'Completed', dot: '#00ff41' },
  failed:    { color: '#ff4444', label: 'Failed',    dot: '#ff4444' },
  active:    { color: '#5b7cfa', label: 'Active',    dot: '#5b7cfa' },
  idle:      { color: '#5a6070', label: 'Idle',      dot: '#5a6070' },
};

export default function StatusBadge({ status = 'idle', style = {} }) {
  const s = STATUS_MAP[status] || STATUS_MAP.idle;
  const isAnimated = status === 'running';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-mono)', fontSize: 10,
      textTransform: 'uppercase', letterSpacing: 1.5,
      padding: '3px 10px', borderRadius: 2,
      border: `1px solid ${s.color}30`,
      background: `${s.color}0d`,
      color: s.color,
      ...style,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: s.dot,
        animation: isAnimated ? 'pulse 1.4s ease infinite' : 'none',
      }} />
      {s.label}
    </span>
  );
}
