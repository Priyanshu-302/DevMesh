import { useEffect, useRef } from 'react';

const AGENT_COLORS = {
  architect: '#5b7cfa',
  developer: '#ff6b2b',
  qa:        '#f5c518',
};

export default function AgentChatFeed({ logs = [], isRunning = true }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const activeLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const activeAgent = activeLog?.agent || 'architect';
  const activeColor = activeLog?.color || AGENT_COLORS[activeAgent] || 'var(--orange)';

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--panel-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
          <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>agent output</span>
        </div>
        {isRunning && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: activeColor, textTransform: 'uppercase', letterSpacing: 1,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeColor, animation: 'pulse 1s infinite' }} />
            {activeAgent} active
          </span>
        )}
      </div>

      <div style={{ maxHeight: 320, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.9 }}>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Waiting for agents to start…</p>
        ) : (
          logs.map((l, i) => {
            const agentColor = l.color || AGENT_COLORS[l.agent] || 'var(--steel)';
            const textContent = l.text || l.message || '';
            return (
              <div key={i} style={{ display: 'flex', gap: 10, animation: 'fadeInUp 0.3s ease both' }}>
                <span style={{ color: agentColor, minWidth: 92, fontWeight: 600, flexShrink: 0 }}>[{l.agent}]</span>
                <span style={{ color: 'var(--steel)', wordBreak: 'break-word' }}>{textContent}</span>
              </div>
            );
          })
        )}

        {/* Real-time Agent Thinking Indicator */}
        {isRunning && (
          <div style={{
            marginTop: 10, padding: '8px 12px',
            background: 'rgba(20, 20, 26, 0.6)',
            border: `1px solid ${activeColor}33`,
            borderRadius: 4,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              fontSize: 11, fontFamily: 'var(--font-mono)',
              color: activeColor, fontWeight: 600, textTransform: 'uppercase',
            }}>
              [{activeAgent}]
            </span>
            <div style={{ flex: 1, height: 3, background: 'var(--panel-border)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                background: activeColor, borderRadius: 2,
                animation: 'thinkSlide 1.8s ease-in-out infinite',
              }} />
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              thinking...
            </span>
          </div>
        )}

        {/* Cursor */}
        <span style={{
          display: 'inline-block', width: 8, height: 14,
          background: 'var(--orange)', marginLeft: 4,
          animation: 'blink 1s step-end infinite', verticalAlign: 'middle',
        }} />
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

