import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BASE_COMMANDS = [
  { id: "dashboard",  label: "Go to Dashboard",     icon: "▦", path: "/dashboard", category: "Navigate" },
  { id: "home",       label: "Go to Landing Page",  icon: "⌂", path: "/",          category: "Navigate" },
  { id: "login",      label: "Log in",               icon: "→", path: "/login",     category: "Account"  },
  { id: "signup",     label: "Sign up",              icon: "⚡", path: "/signup",    category: "Account"  },
];

export default function CommandPalette() {
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(p => !p); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) { setQuery(""); setSelected(0); setTimeout(() => inputRef.current?.focus(), 40); }
  }, [open]);

  const filtered = BASE_COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    else if (e.key === "Enter" && filtered[selected]) execute(filtered[selected]);
  };

  const execute = (cmd) => { navigate(cmd.path); setOpen(false); };

  if (!open) return null;

  const groups = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  return (
    <div onClick={() => setOpen(false)} style={{
      position: "fixed", inset: 0, zIndex: 9500,
      background: "rgba(0,0,0,0.75)", display: "flex",
      alignItems: "flex-start", justifyContent: "center",
      paddingTop: "14vh", backdropFilter: "blur(6px)",
      animation: "fadeIn 0.15s ease both",
    }}>
      <div className="glass-panel" onClick={e => e.stopPropagation()} onKeyDown={handleKey}
        style={{
          width: "94%", maxWidth: 580, borderRadius: 8, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,107,43,0.15)",
          animation: "fadeInUp 0.18s ease both",
        }}
      >
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--panel-border)" }}>
          <span style={{ fontSize: 18, color: "var(--orange)", flexShrink: 0 }}>⌘</span>
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Type a command or search…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--steel)" }}
          />
          <kbd style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", border: "1px solid var(--panel-border)", borderRadius: 3, padding: "3px 7px" }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 340, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "28px 18px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>
              No commands found for "{query}"
            </div>
          ) : (
            Object.entries(groups).map(([category, cmds]) => (
              <div key={category}>
                <div style={{ padding: "8px 18px 4px", fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)" }}>{category}</div>
                {cmds.map(cmd => {
                  const idx = filtered.indexOf(cmd);
                  const active = idx === selected;
                  return (
                    <button key={cmd.id} onClick={() => execute(cmd)} onMouseEnter={() => setSelected(idx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        width: "100%", padding: "11px 18px",
                        background: active ? "rgba(255,107,43,0.09)" : "none",
                        border: "none", borderLeft: active ? "2px solid var(--orange)" : "2px solid transparent",
                        cursor: "pointer", textAlign: "left", transition: "all 0.1s",
                      }}
                    >
                      <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                        background: active ? "rgba(255,107,43,0.15)" : "rgba(255,255,255,0.04)",
                        borderRadius: 5, fontSize: 14, color: active ? "var(--orange)" : "var(--muted)", flexShrink: 0 }}>
                        {cmd.icon}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: active ? "var(--steel)" : "var(--muted)" }}>
                        {cmd.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 18px", borderTop: "1px solid var(--panel-border)", display: "flex", gap: 18, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
          <span>↑↓ <span style={{ color: "var(--steel)" }}>navigate</span></span>
          <span>↵ <span style={{ color: "var(--steel)" }}>select</span></span>
          <span>ESC <span style={{ color: "var(--steel)" }}>close</span></span>
          <span style={{ marginLeft: "auto", color: "var(--orange)" }}>Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
