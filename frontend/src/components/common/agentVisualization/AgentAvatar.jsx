export const AGENT_CONFIG = {
  architect: { color: "#5b7cfa", label: "Architect", letter: "A" },
  developer: { color: "#ff6b2b", label: "Developer", letter: "D" },
  qa:        { color: "#f5c518", label: "QA Tester", letter: "Q" },
};

function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

export default function AgentAvatar({ agent, status = "idle", size = 52 }) {
  const cfg  = AGENT_CONFIG[agent] || { color: "#5a6070", label: agent, letter: "?" };
  const { color, letter } = cfg;
  const cx = size / 2, cy = size / 2;
  const r  = size * 0.42;
  const uid = `${agent}-${size}`;

  const isRunning   = status === "running";
  const isDone      = status === "completed";
  const isFailed    = status === "failed";
  const isIdle      = !isRunning && !isDone && !isFailed;

  const strokeColor  = isFailed ? "#ff4444" : color;
  const strokeWidth  = isRunning ? 2.2 : 1.5;
  const bodyOpacity  = isIdle ? 0.4 : 1;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`rg-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={color} stopOpacity={isRunning ? 0.4 : isDone ? 0.25 : 0.1} />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </radialGradient>
      </defs>

      {/* Spinning outer ring (RUNNING only) */}
      {isRunning && (
        <polygon
          points={hexPoints(cx, cy, r + 9)}
          fill="none" stroke={color} strokeWidth="1.5"
          strokeOpacity="0.5" strokeDasharray="5 4"
          style={{ animation: "hexSpin 2.5s linear infinite", transformOrigin: `${cx}px ${cy}px` }}
        />
      )}

      {/* Glow ring (RUNNING pulsing) */}
      {isRunning && (
        <polygon
          points={hexPoints(cx, cy, r + 4)}
          fill="none" stroke={color} strokeWidth="3"
          strokeOpacity="0.15"
          style={{ animation: "pulse 1.2s ease infinite" }}
        />
      )}

      {/* Main hex body */}
      <polygon
        points={hexPoints(cx, cy, r)}
        fill={`url(#rg-${uid})`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={bodyOpacity}
        style={isFailed ? { animation: "flicker 0.25s ease infinite" } : {}}
      />

      {/* Inner state icon */}
      {isRunning && (
        <circle cx={cx} cy={cy} r={r * 0.16} fill={color}
          style={{ animation: "pulse 0.9s ease infinite" }}
        />
      )}

      {isDone && (
        <text x={cx} y={cy + r * 0.22} textAnchor="middle"
          fill={color} fontSize={r * 0.55} fontFamily="Archivo, sans-serif" fontWeight="800">
          ✓
        </text>
      )}

      {isFailed && (
        <text x={cx} y={cy + r * 0.22} textAnchor="middle"
          fill="#ff4444" fontSize={r * 0.55} fontFamily="Archivo, sans-serif" fontWeight="800">
          ✕
        </text>
      )}

      {isIdle && (
        <text x={cx} y={cy + r * 0.18} textAnchor="middle"
          fill={color} fontSize={r * 0.45} fontFamily="Archivo, sans-serif"
          fontWeight="700" opacity="0.6">
          {letter}
        </text>
      )}
    </svg>
  );
}

/** Compact horizontal status row — use in workspace cards or headers */
export function AgentStatusRow({ logs = [], status = "pending" }) {
  const activeAgent = logs.length > 0 ? logs[logs.length - 1].agent : null;

  const agentSt = (id) => {
    if (status === "completed") return "completed";
    if (status === "failed")    return "failed";
    if (activeAgent === id)     return "running";
    const idx = ["architect", "developer", "qa"].indexOf(id);
    const aIdx = ["architect", "developer", "qa"].indexOf(activeAgent);
    return idx < aIdx ? "completed" : "idle";
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {Object.entries(AGENT_CONFIG).map(([id, cfg]) => {
        const st = agentSt(id);
        return (
          <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <AgentAvatar agent={id} status={st} size={44} />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              textTransform: "uppercase", letterSpacing: 1,
              color: st === "running" ? cfg.color : "var(--muted)",
            }}>
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
