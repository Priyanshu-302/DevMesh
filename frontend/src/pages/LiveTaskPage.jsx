import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import { useTaskSocket } from '../hooks/useTaskSocket';
import AgentGraph     from '../components/common/agentVisualization/AgentGraph';
import AgentChatFeed  from '../components/common/agentVisualization/AgentChatFeed';
import FileDiffViewer from '../components/common/agentVisualization/FileDiffViewer';
import QaResultPanel  from '../components/common/agentVisualization/QaResultPanel';
import RetryLoopBadge from '../components/common/agentVisualization/RetryLoopBadge';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';

/* ── Dev mock data (used when no backend is running) ─────── */
const DEV_MOCK_TASK = {
  title: 'Add JWT Refresh Token Logic',
  description: 'Implement a refresh token endpoint and update session management in the auth module.',
};
const DEV_MOCK_LOGS = [
  { agent: 'architect', type: 'log', message: 'Studying codebase structure…' },
  { agent: 'architect', type: 'log', message: 'Drafting plan for src/auth/session.ts' },
  { agent: 'developer', type: 'log', message: 'Writing validateToken(payload): boolean' },
  { agent: 'developer', type: 'diff', file: 'src/auth/session.ts', diff: '+export function validateToken(payload) {\n+  if (!payload?.exp) return false;\n+  return payload.exp > Date.now() / 1000;\n+}' },
  { agent: 'developer', type: 'log', message: 'Writing refreshSession(userId): Session' },
  { agent: 'qa',        type: 'log', message: 'Running test suite… 2 failed' },
  { agent: 'qa',        type: 'log', message: 'Retry cycle: 1' },
  { agent: 'developer', type: 'log', message: 'Patched null check on payload' },
  { agent: 'qa',        type: 'log', message: 'All checks passed ✓' },
];
const DEV_MOCK_QA = {
  passed: true,
  summary: 'All 14 tests passed after 1 retry cycle.',
  tests: [
    { name: 'validateToken — valid payload', passed: true },
    { name: 'validateToken — expired token', passed: true },
    { name: 'refreshSession — returns session', passed: true },
    { name: 'refreshSession — invalid userId', passed: true },
  ],
};

export default function LiveTaskPage() {
  const { workspaceId, taskId } = useParams();
  const [task, setTask]         = useState(null);
  const [loading, setLoading]   = useState(true);

  const { logs, status, qaResult, retryCount } = useTaskSocket(taskId);

  useEffect(() => {
    taskApi.getById(taskId)
      .then(r => setTask(r.data))
      .catch(() => setTask(DEV_MOCK_TASK))   // ← use mock if API fails
      .finally(() => setLoading(false));
  }, [taskId]);

  /* Use real socket data if available, else fall back to dev mock */
  const displayLogs      = logs?.length     ? logs      : DEV_MOCK_LOGS;
  const displayStatus    = status           || 'completed';
  const displayQaResult  = qaResult         || DEV_MOCK_QA;
  const displayRetry     = retryCount       ?? 1;

  if (loading) return <div className="page-content"><Loader label="Loading task…" /></div>;

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', marginBottom:16 }}>
        <Link to="/dashboard" style={{ color:'var(--orange)' }}>dashboard</Link>
        <span style={{ margin:'0 8px' }}>/</span>
        <Link to={`/workspace/${workspaceId}`} style={{ color:'var(--orange)' }}>workspace</Link>
        <span style={{ margin:'0 8px' }}>/</span>
        task
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:22, fontWeight:800, textTransform:'uppercase', lineHeight:1.1 }}>
            {task?.title || 'Live Task'}
          </h1>
          {task?.description && (
            <p style={{ color:'var(--muted)', fontSize:13, marginTop:6, maxWidth:500 }}>{task.description}</p>
          )}
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
          <StatusBadge status={displayStatus} />
          <RetryLoopBadge count={displayRetry} />
        </div>
      </div>

      {/* Hazard divider */}
      <div className="hazard-stripe" style={{ height:2, marginBottom:28, borderRadius:1 }} />

      {/* Agent Graph — full width */}
      <div style={{ marginBottom:24 }}>
        <AgentGraph status={displayStatus} logs={displayLogs} />
      </div>

      {/* 2-col grid: Chat | Diff */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <AgentChatFeed logs={displayLogs} />
        <FileDiffViewer logs={displayLogs} />
      </div>

      {/* QA Results — full width */}
      <QaResultPanel qaResult={displayQaResult} />
    </div>
  );
}

