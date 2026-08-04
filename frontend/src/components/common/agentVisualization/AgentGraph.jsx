import StatusBadge from '../StatusBadge';
import AgentAvatar, { AGENT_CONFIG } from './AgentAvatar';

const AGENTS = [
  { id: 'architect', label: 'Architect', color: '#5b7cfa' },
  { id: 'developer', label: 'Developer', color: '#ff6b2b' },
  { id: 'qa',        label: 'QA Tester', color: '#f5c518' },
];

function hexPoints(cx, cy, size) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + size * Math.cos(a)},${cy + size * Math.sin(a)}`;
  }).join(' ');
}

export default function AgentGraph({ status = 'pending', logs = [] }) {
  const activeAgent = logs.length > 0 ? logs[logs.length - 1].agent : null;

  const agentStatus = (id) => {
    if (status === 'completed') return 'completed';
    if (status === 'failed')    return 'failed';
    if (activeAgent === id)     return 'running';
    const idx      = AGENTS.findIndex(a => a.id === id);
    const activeIdx = AGENTS.findIndex(a => a.id === activeAgent);
    return idx < activeIdx ? 'completed' : 'idle';
  };

  const W = 500, H = 160, SIZE = 50;
  const pos = [{ cx: 95, cy: 80 }, { cx: 250, cy: 80 }, { cx: 405, cy: 80 }];

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)' }}>
          Agent Pipeline
        </span>
        <StatusBadge status={status} />
      </div>

      {/* SVG connection beams */}
      <div style={{ animation: 'floatY 5s ease-in-out infinite' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
          {[0, 1].map(i => {
            const len = Math.hypot(pos[i+1].cx - pos[i].cx - SIZE*2 - 4, 0);
            return (
              <line key={i}
                x1={pos[i].cx + SIZE + 2} y1={pos[i].cy}
                x2={pos[i+1].cx - SIZE - 2} y2={pos[i+1].cy}
                stroke={AGENTS[i].color} strokeWidth="1.5"
                strokeDasharray={`${len} ${len}`} strokeDashoffset="200"
                strokeLinecap="round" opacity="0.6"
                style={{ animation: `beam 2.8s ease-in-out ${i * 1.4}s infinite` }}
              />
            );
          })}

          {AGENTS.map((a, i) => {
            const st      = agentStatus(a.id);
            const isActive = st === 'running';
            return (
              <g key={a.id} style={{ animation: `fadeInUp 0.5s ease ${i * 0.2}s both` }}>
                <defs>
                  <radialGradient id={`rg-${a.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stopColor={a.color} stopOpacity={isActive ? 0.3 : 0.08} />
                    <stop offset="100%" stopColor={a.color} stopOpacity="0.01" />
                  </radialGradient>
                </defs>
                {/* Outer spin ring */}
                {isActive && (
                  <polygon
                    points={hexPoints(pos[i].cx, pos[i].cy, SIZE + 10)}
                    fill="none" stroke={a.color} strokeWidth="1.2" strokeOpacity="0.35"
                    strokeDasharray="5 4"
                    style={{ animation: `hexSpin 2.5s linear infinite`, transformOrigin: `${pos[i].cx}px ${pos[i].cy}px` }}
                  />
                )}
                <polygon
                  points={hexPoints(pos[i].cx, pos[i].cy, SIZE)}
                  fill={`url(#rg-${a.id})`}
                  stroke={st === 'failed' ? '#ff4444' : a.color}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  opacity={st === 'idle' ? 0.4 : 1}
                />
                {isActive && (
                  <circle cx={pos[i].cx} cy={pos[i].cy} r="5" fill={a.color}
                    style={{ animation: 'pulse 1s ease infinite' }}
                  />
                )}
                {st === 'completed' && (
                  <text x={pos[i].cx} y={pos[i].cy + 5} textAnchor="middle"
                    fill={a.color} fontSize="14" fontFamily="Archivo, sans-serif" fontWeight="800">✓</text>
                )}
                {st === 'failed' && (
                  <text x={pos[i].cx} y={pos[i].cy + 5} textAnchor="middle"
                    fill="#ff4444" fontSize="14" fontFamily="Archivo, sans-serif" fontWeight="800">✕</text>
                )}
                {st === 'idle' && (
                  <text x={pos[i].cx} y={pos[i].cy + 4} textAnchor="middle"
                    fill={a.color} fontSize="11" fontFamily="Archivo, sans-serif" fontWeight="700" opacity="0.5">
                    {a.label[0].toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Avatar Status Row ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
        marginTop: 16, paddingTop: 16,
        borderTop: '1px solid var(--panel-border)',
      }}>
        {AGENTS.map(a => {
          const st = agentStatus(a.id);
          return (
            <div key={a.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <AgentAvatar agent={a.id} status={st} size={50} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: AGENT_CONFIG[a.id]?.color || a.color, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                  {a.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, marginTop: 2,
                  color: st === 'running' ? 'var(--orange)' : st === 'completed' ? 'var(--green)' : st === 'failed' ? 'var(--red)' : 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {st === 'running' ? '● active' : st}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
