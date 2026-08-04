import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';

const CHARS = 'アイウエオABCDEF0123456789{}[]=+';

import { useEffect, useRef } from 'react';
function MatrixBg() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let id;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const cols = Math.floor(canvas.width / 20);
    const drops = Array(cols).fill(1);
    const draw = () => {
      ctx.fillStyle = 'rgba(10,10,12,0.05)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.font = '14px JetBrains Mono, monospace';
      drops.forEach((y,i) => {
        ctx.fillStyle = 'rgba(0,255,65,0.04)';
        ctx.fillText(CHARS[Math.floor(Math.random()*CHARS.length)], i*20, y*20);
        if (y*20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(id); };
  }, []);
  return <canvas ref={ref} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none', opacity:0.45 }} />;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setLoading(true);
    try   { await login(form); navigate(ROUTES.DASHBOARD); }
    catch { setError('Invalid email or password.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <MatrixBg />
      <form onSubmit={handleSubmit} className="glass-panel" style={{
        position:'relative', zIndex:1, width:'100%', maxWidth:400, padding:40, margin:16,
        animation:'fadeInUp 0.5s ease both',
        borderTop:'3px solid var(--orange)',
        boxShadow:'0 0 60px rgba(255,107,43,0.1)',
      }}>
        <Link to={ROUTES.HOME} style={{ textDecoration:'none' }}>
          <span className="font-display" style={{ fontSize:17, fontWeight:800, textTransform:'uppercase', letterSpacing:2 }}>
            Dev<span style={{ color:'var(--orange)' }}>Mesh</span>
          </span>
        </Link>
        <h1 className="font-display" style={{ fontSize:22, fontWeight:800, textTransform:'uppercase', marginTop:16, marginBottom:4 }}>Log In</h1>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--muted)', marginBottom:28 }}>Access your agent workspace</p>

        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div>
            <label className="dm-label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" required className="dm-input" value={form.email} placeholder="you@example.com" onChange={e => setForm({...form, email:e.target.value})} />
          </div>
          <div>
            <label className="dm-label" htmlFor="login-password">Password</label>
            <input id="login-password" type="password" required className="dm-input" value={form.password} placeholder="••••••••" onChange={e => setForm({...form, password:e.target.value})} />
          </div>
          {error && <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--red)', padding:'8px 12px', background:'rgba(255,68,68,0.08)', borderRadius:3, border:'1px solid rgba(255,68,68,0.2)' }}>⚠ {error}</p>}
          <Button type="submit" disabled={loading} style={{ width:'100%', marginTop:4 }}>
            {loading ? '⟳ Authenticating…' : '→ Log In'}
          </Button>
        </div>
        <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--muted)', textAlign:'center', marginTop:24 }}>
          No account? <Link to={ROUTES.SIGNUP} style={{ color:'var(--orange)' }}>Sign up</Link>
        </p>
      </form>
    </div>
  );
}
