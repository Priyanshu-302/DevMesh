import { useState, useEffect, useRef } from 'react';

const GUIDE_DB = {
  devmesh: `🤖 **DevMesh** is a multi-agent AI workspace designed like a software factory floor. Instead of a single chatbot, it coordinates three specialized agents (Architect, Developer, and QA) to plan, write, and inspect code changes live.`,
  agents: `🎭 **The DevMesh Agent Crew**:\n\n1. **📐 Architect**: Scans repository AST, plans changes, and drafts task blueprints.\n2. **⚡ Developer**: Translates blueprints into code patches, streaming WebSocket diffs.\n3. **🔍 QA Inspector**: Runs unit test suites and triggers self-correcting loops to fix bugs automatically.`,
  caching: `🚀 **Zero-Cost Stack**: DevMesh indexes your repository AST structure once into a local vector cache. It doesn't re-upload your entire codebase on every prompt, saving over 95% on LLM token costs and running at blazing speeds.`,
  workspaces: `📁 **Workspaces**: A workspace is an isolated sandbox environment. You upload your codebase (via .zip file), describe what you want built, and trigger the agent pipeline to edit files live.`,
  started: `⚡ **Getting Started**:\n\n1. Go to your **Dashboard** and click **+ New Workspace**.\n2. Upload your codebase ZIP on the **Upload Codebase** tab.\n3. Head to **Run Agents**, enter your feature request, and watch the live workspace graph weld code!`,
  default: `👋 Hello! I am **MeshBot**, your guide robot. You can ask me about:\n\n- **devmesh** (what is this app?)\n- **agents** (Architect, Developer, QA)\n- **caching** (zero-cost cached vector index)\n- **workspaces** (how to create and upload)\n- **started** (getting started guide)\n\nClick one of the quick questions below or type a query! 🤖`
};

export default function HelpRobotChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: GUIDE_DB.default }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const feedEndRef = useRef(null);

  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleQuery = (queryText) => {
    if (!queryText.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate robot brain latency
    setTimeout(() => {
      const normalized = queryText.toLowerCase();
      let reply = '';

      if (normalized.includes('agent') || normalized.includes('architect') || normalized.includes('developer') || normalized.includes('qa')) {
        reply = GUIDE_DB.agents;
      } else if (normalized.includes('cache') || normalized.includes('zero-cost') || normalized.includes('cost') || normalized.includes('token')) {
        reply = GUIDE_DB.caching;
      } else if (normalized.includes('workspace') || normalized.includes('project') || normalized.includes('zip')) {
        reply = GUIDE_DB.workspaces;
      } else if (normalized.includes('start') || normalized.includes('how') || normalized.includes('guide') || normalized.includes('use')) {
        reply = GUIDE_DB.started;
      } else if (normalized.includes('devmesh') || normalized.includes('what is')) {
        reply = GUIDE_DB.devmesh;
      } else {
        reply = `🔍 I'm searching my database... For best results, ask me about **agents**, **caching**, **workspaces**, or **started**.\n\nHere's a quick guide:\n\n${GUIDE_DB.default}`;
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
      setIsTyping(false);
    }, 950);
  };

  const handleQuickQuestion = (key) => {
    // Show user question
    const questionsText = {
      devmesh: 'What is DevMesh?',
      agents: 'Who are the 3 agents?',
      caching: 'How does Zero-Cost Caching work?',
      workspaces: 'How do I use workspaces?',
      started: 'How do I get started?'
    };

    const userText = questionsText[key] || `Tell me about ${key}`;
    const userMsg = { sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: GUIDE_DB[key] }]);
      setIsTyping(false);
    }, 800);
  };

  // Convert double-asterisk to strong tags, bullet points to formatted blocks
  const formatMarkdown = (text) => {
    return text.split('\n').map((line, idx) => {
      let formatted = line;
      // Match bold text **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      formatted = formatted.replace(boldRegex, '<strong>$1</strong>');
      
      if (line.startsWith('- ')) {
        return <li key={idx} style={{ marginLeft: 12, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: formatted.substring(2) }} />;
      }
      if (line.match(/^\d+\.\s/)) {
        const numContent = line.replace(/^\d+\.\s/, '');
        return <div key={idx} style={{ marginLeft: 12, marginBottom: 6, display: 'flex', gap: 6 }}>
          <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>{line.match(/^\d+/)[0]}.</span>
          <span dangerouslySetInnerHTML={{ __html: numContent }} />
        </div>;
      }
      return <p key={idx} style={{ marginBottom: 8, minHeight: line === '' ? 8 : 'auto' }} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'var(--font-body)' }}>
      
      {/* ─── Chat Window Panel ─── */}
      {isOpen && (
        <div className="glass-panel" style={{
          width: 360,
          height: 480,
          maxHeight: '75vh',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 25px rgba(255,107,43,0.15)',
          border: '1px solid rgba(255,107,43,0.25)',
          borderRadius: 8,
          overflow: 'hidden',
          animation: 'fadeInUp 0.3s ease both',
        }}>
          {/* Header */}
          <div style={{
            background: 'rgba(15, 15, 18, 0.95)',
            borderBottom: '1px solid var(--panel-border)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none" style={{ animation: isTyping ? 'pulse 1s infinite' : 'none' }}>
                <rect x="8" y="14" width="32" height="24" rx="4" fill="#ff6b2b" fillOpacity="0.15" stroke="#ff6b2b" strokeWidth="3" />
                <path d="M18 24h2v2h-2zm10 0h2v2h-2z" fill="#ff6b2b" />
                <path d="M14 26c2 3 6 4 10 4s8-1 10-4" stroke="#ff6b2b" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M24 14v-6h4" stroke="#ff6b2b" strokeWidth="3" strokeLinecap="round" />
                <circle cx="28" cy="8" r="3" fill="#ff6b2b" />
                <path d="M6 22v8M42 22v8" stroke="#ff6b2b" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div>
                <div className="font-display" style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>MeshBot Guide</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isTyping ? 'var(--orange)' : 'var(--green)' }}>
                  {isTyping ? '● thinking...' : '● online'}
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >
              ✕
            </button>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  background: m.sender === 'user' ? 'var(--orange)' : 'rgba(255, 255, 255, 0.03)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--panel-border)',
                  color: m.sender === 'user' ? '#fff' : 'var(--steel)',
                  padding: '10px 14px',
                  borderRadius: 4,
                  fontSize: 12,
                  lineHeight: 1.6,
                  boxShadow: m.sender === 'user' ? '0 3px 10px rgba(255,107,43,0.2)' : 'none',
                }}>
                  {formatMarkdown(m.text)}
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: 'var(--muted)',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginTop: 4,
                  padding: '0 4px'
                }}>
                  {m.sender === 'user' ? 'You' : 'MeshBot'}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', padding: '10px 18px', borderRadius: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', animation: 'blink 1.2s infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', animation: 'blink 1.2s 0.2s infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', animation: 'blink 1.2s 0.4s infinite' }} />
              </div>
            )}
            
            <div ref={feedEndRef} />
          </div>

          {/* Quick suggestions menu */}
          <div style={{
            padding: '8px 12px',
            background: 'rgba(10, 10, 12, 0.4)',
            borderTop: '1px solid var(--panel-border)',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {[['devmesh', 'DevMesh?'], ['agents', 'Agents?'], ['caching', 'Caching?'], ['started', 'Get Started⚡']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleQuickQuestion(key)}
                className="btn btn-outline"
                style={{
                  fontSize: 9,
                  padding: '5px 10px',
                  borderRadius: 20,
                  flexShrink: 0,
                  textTransform: 'none',
                  letterSpacing: 0.5,
                  height: 'auto'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleQuery(input); }}
            style={{
              padding: 12,
              background: 'rgba(15, 15, 18, 0.95)',
              borderTop: '1px solid var(--panel-border)',
              display: 'flex',
              gap: 8
            }}
          >
            <input
              className="dm-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Architect, QA, caching..."
              style={{ flex: 1, fontSize: 12, padding: '8px 12px' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: 11, minHeight: 'auto' }}
            >
              →
            </button>
          </form>
        </div>
      )}

      {/* ─── Glowing Mechanical Robot Head Float Button ─── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(20, 20, 26, 0.85)',
          border: isOpen ? '2px solid var(--orange)' : '1px solid var(--panel-border)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isOpen
            ? '0 0 25px rgba(255,107,43,0.45), inset 0 0 10px rgba(255,107,43,0.2)'
            : '0 8px 30px rgba(0,0,0,0.5), 0 0 12px rgba(255,107,43,0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          animation: 'floatY 4.5s ease-in-out infinite',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.borderColor = 'var(--orange)';
          e.currentTarget.style.boxShadow = '0 0 22px rgba(255,107,43,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.borderColor = isOpen ? 'var(--orange)' : 'var(--panel-border)';
          e.currentTarget.style.boxShadow = isOpen
            ? '0 0 25px rgba(255,107,43,0.45), inset 0 0 10px rgba(255,107,43,0.2)'
            : '0 8px 30px rgba(0,0,0,0.5), 0 0 12px rgba(255,107,43,0.08)';
        }}
      >
        <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
          {/* Antenna */}
          <path d="M24 12v-6h4" stroke={isOpen ? 'var(--orange)' : 'var(--steel)'} strokeWidth="3" strokeLinecap="round" />
          <circle cx="28" cy="6" r="3.5" fill={isOpen ? 'var(--orange)' : 'var(--steel)'} style={{ transformOrigin: '28px 6px', animation: isTyping ? 'pulse 1s infinite' : 'none' }} />
          
          {/* Head contour */}
          <rect x="8" y="12" width="32" height="26" rx="5" fill="rgba(10,10,12,0.4)" stroke={isOpen ? 'var(--orange)' : 'var(--steel)'} strokeWidth="3.2" />
          
          {/* Ears */}
          <path d="M5 21v8M43 21v8" stroke={isOpen ? 'var(--orange)' : 'var(--steel)'} strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Visor eyes box */}
          <rect x="13" y="18" width="22" height="8" rx="2" fill="var(--void)" stroke={isOpen ? 'rgba(255,107,43,0.2)' : 'none'} strokeWidth="1" />
          
          {/* Eyes (glow orange when open or thinking) */}
          <circle cx="19" cy="22" r="2.5" fill={isOpen || isTyping ? 'var(--orange)' : 'var(--steel)'} style={{ animation: 'blink 3.5s infinite' }} />
          <circle cx="29" cy="22" r="2.5" fill={isOpen || isTyping ? 'var(--orange)' : 'var(--steel)'} style={{ animation: 'blink 3.5s infinite' }} />
          
          {/* Mouth line */}
          <path d="M17 29.5c2 2 6 2.5 14 0" stroke={isOpen ? 'var(--orange)' : 'var(--steel)'} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

    </div>
  );
}
