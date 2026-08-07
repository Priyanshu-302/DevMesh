/* ─── Skeleton Loading Components ───────────────────────── */

export function SkeletonLine({ width = "100%", height = 12, style = {} }) {
  return (
    <div style={{
      width, height,
      background: "linear-gradient(90deg, var(--panel-border) 25%, var(--panel-2) 50%, var(--panel-border) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s ease infinite",
      borderRadius: 3,
      ...style,
    }} />
  );
}

export function SkeletonWorkspaceCard() {
  return (
    <div className="glass-panel" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <SkeletonLine width="55%" height={16} />
        <SkeletonLine width="18%" height={22} style={{ borderRadius: 20 }} />
      </div>
      <SkeletonLine width="80%" height={11} style={{ marginBottom: 8 }} />
      <SkeletonLine width="65%" height={11} style={{ marginBottom: 20 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SkeletonLine width="30%" height={10} />
        <SkeletonLine width="18%" height={10} />
      </div>
    </div>
  );
}

export function SkeletonTaskRow() {
  return (
    <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="40%" height={13} style={{ marginBottom: 8 }} />
        <SkeletonLine width="25%" height={10} />
      </div>
      <SkeletonLine width="70px" height={22} style={{ borderRadius: 20 }} />
    </div>
  );
}

export function SkeletonPage({ rows = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonWorkspaceCard key={i} />
      ))}
    </div>
  );
}
