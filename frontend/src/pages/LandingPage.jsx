import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import DevMeshRoboticWorkflow from '../components/common/agentVisualization/DevMeshRoboticWorkflow';



/* ─── Matrix Rain Canvas ─────────────────────────────── */
const CHARS = 'アイウエオカキクケコABCDEF0123456789{}[]=+/<>';

function MatrixRain() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx    = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cols  = Math.floor(canvas.width / 20);
    const drops = Array(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(10,10,12,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px JetBrains Mono, monospace';
      drops.forEach((y, i) => {
        ctx.fillStyle = y * 20 > canvas.height * 0.65
          ? 'rgba(0,255,65,0.07)'
          : 'rgba(0,255,65,0.03)';
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none', opacity: 0.45,
      }}
    />
  );
}

/* ─── 3D Hex Pipeline ────────────────────────────────── */
const AGENTS = [
  { id: 'architect', label: 'Architect', state: 'Planning',   color: '#5b7cfa' },
  { id: 'developer', label: 'Developer', state: 'Running',    color: '#ff6b2b' },
  { id: 'qa',        label: 'QA Tester', state: 'Inspecting', color: '#f5c518' },
];

function hexPts(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
}

function HexPipeline() {
  const W = 600, H = 220, R = 68;
  const pos = [{ cx: 108, cy: 110 }, { cx: 300, cy: 110 }, { cx: 492, cy: 110 }];

  return (
    <div style={{
      width: '100%', maxWidth: 640, margin: '0 auto',
      animation: 'floatY 5s ease-in-out infinite',
    }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 10px 50px rgba(255,107,43,0.12))' }}
      >
        <defs>
          {AGENTS.map(a => (
            <radialGradient key={a.id} id={`lg-${a.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={a.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={a.color} stopOpacity="0.03" />
            </radialGradient>
          ))}
        </defs>

        {/* Energy beams */}
        {[0, 1].map(i => {
          const len = pos[i+1].cx - pos[i].cx - R * 2 - 4;
          return (
            <line key={i}
              x1={pos[i].cx + R + 2}   y1={pos[i].cy}
              x2={pos[i+1].cx - R - 2} y2={pos[i+1].cy}
              stroke={AGENTS[i].color} strokeWidth="1.5"
              strokeDasharray={`${len} ${len}`} strokeDashoffset="200"
              strokeLinecap="round" opacity="0.7"
              style={{ animation: `beam 2.8s ease-in-out ${i * 1.4}s infinite` }}
            />
          );
        })}

        {/* Hexagons */}
        {AGENTS.map((a, i) => (
          <g key={a.id} style={{ animation: `fadeInUp 0.6s ease ${i * 0.22}s both` }}>
            {/* Outer spinning ring */}
            <polygon
              points={hexPts(pos[i].cx, pos[i].cy, R + 10)}
              fill="none" stroke={a.color} strokeWidth="1" strokeOpacity="0.22"
              style={{
                animation: `hexSpin ${9 + i * 2}s linear infinite`,
                transformOrigin: `${pos[i].cx}px ${pos[i].cy}px`,
              }}
            />
            {/* Hex body */}
            <polygon
              points={hexPts(pos[i].cx, pos[i].cy, R)}
              fill={`url(#lg-${a.id})`} stroke={a.color} strokeWidth="1.5"
            />
            {/* Center dot */}
            <circle cx={pos[i].cx} cy={pos[i].cy - 8} r="5" fill={a.color} opacity="0.9" />
            {/* Label */}
            <text x={pos[i].cx} y={pos[i].cy + 10} textAnchor="middle"
              fill={a.color} fontSize="11"
              fontFamily="Archivo, sans-serif" fontWeight="700" letterSpacing="1.2">
              {a.label.toUpperCase()}
            </text>
            {/* State */}
            <text x={pos[i].cx} y={pos[i].cy + 26} textAnchor="middle"
              fill="#5a6070" fontSize="9" fontFamily="JetBrains Mono, monospace">
              {a.state}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── Terminal Panel ─────────────────────────────────── */
const LOG_LINES = [
  { agent: 'architect', color: '#5b7cfa', text: 'studying codebase structure…' },
  { agent: 'architect', color: '#5b7cfa', text: 'drafting plan for auth-refactor.ts' },
  { agent: 'developer', color: '#ff6b2b', text: 'writing src/auth/session.ts' },
  { agent: 'developer', color: '#ff6b2b', text: '+ validateToken(payload): boolean' },
  { agent: 'developer', color: '#ff6b2b', text: '+ refreshSession(userId): Session' },
  { agent: 'qa',        color: '#f5c518', text: 'running test suite… 2 failed' },
  { agent: 'qa',        color: '#f5c518', text: '↻ retry cycle: 1' },
  { agent: 'developer', color: '#ff6b2b', text: 'patched null check, re-running' },
  { agent: 'qa',        color: '#f5c518', text: 'all checks passed ✓' },
  { agent: 'system',   color: '#00ff41', text: 'task complete — 9 files changed' },
];

function TerminalPanel() {
  const [lines, setLines] = useState([]);
  const [cycle, setCycle] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    setLines([]);
    let i = 0;
    let timeoutId;
    const id = setInterval(() => {
      if (i < LOG_LINES.length) {
        setLines(prev => [...prev, LOG_LINES[i]]);
      }
      i++;
      if (i >= LOG_LINES.length) {
        clearInterval(id);
        timeoutId = setTimeout(() => setCycle(c => c + 1), 2800);
      }
    }, 680);
    return () => { clearInterval(id); clearTimeout(timeoutId); };
  }, [cycle]);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div ref={panelRef} className="glass-panel" style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.9, maxHeight: 300, overflowY: 'auto' }}>
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--panel-border)' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 11 }}>devmesh — agent output</span>
      </div>
      {lines.filter(Boolean).map((l, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 10, animation: 'fadeInUp 0.2s ease both' }}>
          <span style={{ color: l.color, minWidth: 92, fontWeight: 600 }}>[{l.agent}]</span>
          <span style={{ color: 'var(--steel)' }}>{l.text}</span>
        </div>
      ))}
      <span style={{ display: 'inline-block', width: 8, height: 14, background: '#ff6b2b', marginLeft: 4, animation: 'blink 1s step-end infinite', verticalAlign: 'middle' }} />
    </div>
  );
}

/* ─── Scroll Reveal Hook ─────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Single-Line Hero Ticker Slideshow ──────────────────── */
const HERO_TICKERS = [
  { tag: 'ARCHITECT', text: 'Indexes repository AST & builds execution blueprints', color: '#5b7cfa', icon: '📐' },
  { tag: 'DEVELOPER', text: 'Laser-synthesizes code patches & streams live WebSocket diffs', color: '#ff6b2b', icon: '⚡' },
  { tag: 'QA INSPECTOR', text: 'Runs automated unit test suites & handles self-correcting retry loops', color: '#f5c518', icon: '🔍' },
  { tag: 'ZERO-COST STACK', text: 'Fast vector caching — codebase indexed once with $0 token cost', color: '#00ff41', icon: '🚀' },
];

function OneLineSlideshow() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx(prev => (prev + 1) % HERO_TICKERS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const current = HERO_TICKERS[idx];

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: 'var(--font-mono)', fontSize: 12,
      padding: '7px 20px', borderRadius: 20,
      background: 'rgba(20, 20, 26, 0.75)',
      border: `1px solid ${current.color}44`,
      boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 15px ${current.color}15`,
      transition: 'all 0.4s ease',
      maxWidth: '90%', margin: '0 auto 36px',
    }}>
      <span style={{ fontSize: 13 }}>{current.icon}</span>
      <span style={{ color: current.color, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: 10, flexShrink: 0 }}>
        [{current.tag}]
      </span>
      <span style={{ color: 'var(--steel)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {current.text}
      </span>
      <div style={{ display: 'flex', gap: 4, marginLeft: 8, flexShrink: 0 }}>
        {HERO_TICKERS.map((s, i) => (
          <span key={i} style={{
            width: i === idx ? 12 : 4, height: 4, borderRadius: 2,
            background: i === idx ? current.color : 'var(--muted)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Cursor Spotlight ───────────────────────────────── */
function CursorSpotlight() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const move = (e) => {
      if (!el) return;
      el.style.setProperty('--mx', e.clientX + 'px');
      el.style.setProperty('--my', e.clientY + 'px');
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div ref={ref} style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      background: 'radial-gradient(700px circle at var(--mx, 50%) var(--my, 50%), rgba(255,107,43,0.055), transparent 65%)',
      transition: 'background 0.1s',
    }} />
  );
}

/* ─── Animated Stats Counter ─────────────────────────── */
const STATS = [
  { value: 3,    suffix: '',   label: 'Specialized AI Agents',     color: '#5b7cfa' },
  { value: 94,   suffix: '%',  label: 'Avg. Test Pass Rate',        color: '#00ff41' },
  { value: 4,    suffix: 'min',label: 'Avg. Task Completion Time',  color: '#ff6b2b' },
  { value: 12,   suffix: '+',  label: 'Files Changed per Task',     color: '#f5c518' },
];
function useCountUp(target, duration = 1600, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return val;
}
function StatCard({ value, suffix, label, color, active }) {
  const count = useCountUp(value, 1400, active);
  return (
    <div className="glass-panel reveal" style={{
      padding: '28px 20px', textAlign: 'center',
      borderTop: `3px solid ${color}`,
      transition: 'transform 0.3s', cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      <div className="font-display" style={{ fontSize: 44, fontWeight: 800, color, lineHeight: 1, marginBottom: 8 }}>
        {count}{suffix}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.5, lineHeight: 1.5 }}>
        {label}
      </div>
    </div>
  );
}
function StatsCounter() {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} className="lp-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
        {STATS.map(s => <StatCard key={s.label} {...s} active={active} />)}
      </div>
    </section>
  );
}

/* ─── Data ───────────────────────────────────────────── */
const FEATURES = [
  {
    num: '01', title: 'Self-correcting',
    body: 'QA catches issues and routes them back to Developer automatically — bugs get fixed before a human ever sees the output.',
    tag: 'Retry Loop', color: '#f5c518',
  },
  {
    num: '02', title: 'Fully Visible',
    body: 'Every plan, diff, and test run streams live to the dashboard over WebSockets — nothing happens in a black box.',
    tag: 'Live Stream', color: '#5b7cfa',
  },
  {
    num: '03', title: 'Zero-cost Stack',
    body: 'Free-tier inference with smart caching — the codebase is indexed once, not re-read on every request.',
    tag: '$0 to Run', color: '#ff6b2b',
  },
];

const STEPS = [
  { n: '01', title: 'Upload & describe',  body: 'Drop your .zip codebase and describe the feature or bug.' },
  { n: '02', title: 'Architect plans',    body: 'Studies the codebase, drafts a step-by-step execution plan.' },
  { n: '03', title: 'Developer builds',   body: 'Writes and edits code against the plan, live.' },
  { n: '04', title: 'QA inspects',        body: 'Tests the output, kicks back fixes automatically.' },
];

/* ─── Landing Page ───────────────────────────────────── */
export default function LandingPage() {
  useScrollReveal();
  const [scrolled, setScrolled] = useState(false);



  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }} className="scanline-overlay">
      <MatrixRain />
      <CursorSpotlight />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ NAV ══════════════════════════════════════════ */}
        <nav
          className="glass-panel lp-nav"
          style={{
            position: 'sticky', top: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: 64, borderRadius: 0,
            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
            borderBottom: `1px solid ${scrolled ? 'var(--panel-border)' : 'transparent'}`,
            boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            animation: 'fadeInDown 0.5s ease both',
          }}
        >
          {/* Logo */}
          <span className="font-display" style={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, flexShrink: 0 }}>
            Dev<span style={{ color: 'var(--orange)' }}>Mesh</span>
          </span>

          {/* Desktop Links */}
          <div className="lp-nav-links" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)' }}>
            {['Features', 'How it Works'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--orange)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              >
                {l}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="lp-nav-auth">
            <Link to={ROUTES.LOGIN}  className="btn btn-outline lp-nav-login" style={{ fontSize: 11, padding: '8px 18px' }}>Log in</Link>
            <Link to={ROUTES.SIGNUP} className="btn btn-primary"  style={{ fontSize: 11, padding: '8px 18px' }}>Sign up</Link>
          </div>
        </nav>


        {/* ══ HERO ═════════════════════════════════════════ */}
        <section className="lp-section-hero">

          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36, animation: 'fadeInUp 0.6s ease 0.1s both' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--font-mono)', fontSize: 11,
              textTransform: 'uppercase', letterSpacing: 2,
              color: 'var(--yellow)',
              border: '1px solid rgba(245,197,24,0.3)',
              borderRadius: 3, padding: '7px 18px',
              background: 'rgba(245,197,24,0.05)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--yellow)', animation: 'blink 1.5s ease infinite' }} />
              DevMesh — Multi-agent AI Workspace
            </div>
          </div>

          {/* Stable Rock-Solid Headline */}
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(38px, 6.5vw, 76px)',
              fontWeight: 800,
              textTransform: 'uppercase',
              lineHeight: 1.05,
              marginBottom: 28,
              animation: 'fadeInUp 0.6s ease 0.2s both',
            }}
          >
            YOUR AI DEV TEAM<br />
            RUNS ON THE{' '}
            <span style={{
              color: 'var(--orange)',
              textShadow: '0 0 40px rgba(255,107,43,0.6), 0 0 80px rgba(255,107,43,0.2)',
            }}>
              LINE.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            color: 'var(--muted)', fontSize: 19,
            maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7,
            animation: 'fadeInUp 0.6s ease 0.3s both',
          }}>
            Architect, Developer, and QA agents work your codebase like a shift on a
            factory floor — planning, building, and inspecting every task, live.
          </p>

          {/* Single-Line Ticker Slideshow Pill */}
          <div style={{ animation: 'fadeInUp 0.6s ease 0.35s both', textAlign: 'center' }}>
            <OneLineSlideshow />
          </div>

          {/* CTAs */}
          <div className="lp-ctas" style={{ marginBottom: 80, animation: 'fadeInUp 0.6s ease 0.4s both' }}>
            <Link to={ROUTES.SIGNUP} className="btn btn-primary"
              style={{ fontSize: 13, padding: '14px 32px', letterSpacing: 2 }}>
              ⚡ Start a Workspace
            </Link>
            <a href="#how-it-works" className="btn btn-outline"
              style={{ fontSize: 13, padding: '14px 32px', letterSpacing: 2 }}>
              See How It Works
            </a>
          </div>

          {/* 3D Robotic Multi-Agent Workflow Simulation */}
          <div style={{ animation: 'fadeInUp 0.9s ease 0.5s both', maxWidth: 960, margin: '0 auto' }}>
            <DevMeshRoboticWorkflow />
          </div>
        </section>



        {/* ══ FEATURES ═════════════════════════════════════ */}
        <section id="features" className="lp-section">

          {/* Section label */}
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              textTransform: 'uppercase', letterSpacing: 3,
              color: 'var(--orange)', display: 'block', marginBottom: 14,
            }}>
              Why DevMesh
            </span>
            <h2 className="font-display" style={{ fontSize: 34, fontWeight: 800, textTransform: 'uppercase', marginBottom: 14 }}>
              Not a Chatbot. A Shift Crew.
            </h2>
            <p style={{ color: 'var(--muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.65, fontSize: 16 }}>
              Three specialized agents that plan, build, and inspect each other's work automatically — no human in the loop.
            </p>
          </div>

          {/* Feature cards */}
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                className="glass-panel reveal"
                style={{
                  padding: 30,
                  borderTop: `3px solid ${f.color}`,
                  boxShadow: `0 4px 30px ${f.color}12`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  transitionDelay: `${i * 0.08}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-7px)';
                  e.currentTarget.style.boxShadow = `0 16px 50px ${f.color}28`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = `0 4px 30px ${f.color}12`;
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 14 }}>{f.num}</div>
                <h3 className="font-display" style={{ fontSize: 19, fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 20 }}>{f.body}</p>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
                  letterSpacing: 1.5, padding: '4px 12px',
                  border: `1px solid ${f.color}60`, borderRadius: 2, color: f.color,
                }}>
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ STATS COUNTER ═════════════════════════════════ */}
        <StatsCounter />

        {/* ══ DIVIDER ══════════════════════════════════════ */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px' }}>
          <div className="hazard-stripe" style={{ height: 3, borderRadius: 2 }} />
        </div>

        {/* ══ HOW IT WORKS ═════════════════════════════════ */}
        <section id="how-it-works" className="lp-section">
          <div className="lp-how-grid">

            {/* Left: Steps */}
            <div className="reveal">
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                textTransform: 'uppercase', letterSpacing: 3,
                color: 'var(--yellow)', display: 'block', marginBottom: 14,
              }}>
                How It Works
              </span>
              <h2 className="font-display" style={{ fontSize: 30, fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.15, marginBottom: 40 }}>
                From Request<br />to Reviewed Code
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                {STEPS.map((s, i) => (
                  <div key={s.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    {/* Number */}
                    <span
                      className="font-display"
                      style={{ fontSize: 26, fontWeight: 800, color: 'var(--orange)', minWidth: 44, opacity: 0.4, lineHeight: 1 }}
                    >
                      {s.n}
                    </span>
                    <div>
                      <h4 className="font-display" style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>
                        {s.title}
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
                        {s.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hazard-stripe" style={{ height: 3, marginTop: 40, borderRadius: 2 }} />
            </div>

            {/* Right: Live Terminal */}
            <div className="reveal" style={{ transitionDelay: '0.15s' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 16 }}>
                Live Agent Output
              </div>
              <TerminalPanel />
            </div>
          </div>
        </section>

        {/* ══ CTA BANNER ═══════════════════════════════════ */}
        <section className="lp-cta-section">
          <div className="glass-panel reveal lp-cta-card">
            <h2 className="font-display" style={{ fontSize: 28, fontWeight: 800, textTransform: 'uppercase', marginBottom: 14 }}>
              Ready to ship faster?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 28 }}>
              Upload your codebase and let the agents handle the rest.
            </p>
            <Link to={ROUTES.SIGNUP} className="btn btn-primary" style={{ fontSize: 13, padding: '14px 36px', letterSpacing: 2 }}>
              ⚡ Get Started Free
            </Link>
          </div>
        </section>


        <footer style={{
          borderTop: '1px solid var(--panel-border)',
          marginTop: 16,
        }}>
          <div className="lp-footer-grid" style={{ maxWidth: 1100, margin: '0 auto', borderBottom: '1px solid var(--panel-border)' }}>
            {/* Brand */}
            <div>
              <span className="font-display" style={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 12 }}>
                Dev<span style={{ color: 'var(--orange)' }}>Mesh</span>
              </span>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, maxWidth: 240 }}>
                Three AI agents that plan, build, and inspect your code — live, in one workspace.
              </p>
            </div>

            {/* Product */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--orange)', marginBottom: 14 }}>Product</div>
              {['Features', 'How it works', 'Agent Pipeline', 'Live Demo'].map(l => (
                <div key={l} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 9, cursor: 'pointer',
                  transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--steel)'}
                  onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                  {l}
                </div>
              ))}
            </div>

            {/* Agents */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--orange)', marginBottom: 14 }}>Agents</div>
              {[['Architect', '#5b7cfa'], ['Developer', '#ff6b2b'], ['QA Tester', '#f5c518']].map(([name, color]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 9 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  {name}
                </div>
              ))}
            </div>

            {/* Account */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--orange)', marginBottom: 14 }}>Account</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <Link to={ROUTES.LOGIN}  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--steel)'} onMouseLeave={e => e.target.style.color = 'var(--muted)'}>Log in</Link>
                <Link to={ROUTES.SIGNUP} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--orange)', textDecoration: 'none' }}>Sign up →</Link>
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
              © 2026 <span style={{ color: 'var(--steel)' }}>DevMesh</span>. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {['Architect', 'Developer', 'QA'].map((a, i) => (
                <span key={a} style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  padding: '3px 10px', borderRadius: 2,
                  border: `1px solid ${['#5b7cfa44','#ff6b2b44','#f5c51844'][i]}`,
                  color: ['#5b7cfa','#ff6b2b','#f5c518'][i],
                }}>{a}</span>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
