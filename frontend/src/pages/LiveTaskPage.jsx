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

export default function LiveTaskPage() {
  const { workspaceId, taskId } = useParams();
  const [task, setTask]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const { logs, status, qaResult, retryCount } = useTaskSocket(taskId);

  useEffect(() => {
    taskApi.getById(taskId)
      .then(r => setTask(r.data))
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load task.'))
      .finally(() => setLoading(false));
  }, [taskId]);

  const displayLogs      = logs || [];
  const displayStatus    = status || 'pending';
  const displayQaResult  = qaResult || null;
  const displayRetry     = retryCount || 0;

  if (loading) return <div className="page-content"><Loader label="Loading task…" /></div>;
  if (error)   return <div className="page-content" style={{ fontFamily:'var(--font-mono)', color:'var(--red)' }}>⚠ {error}</div>;

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

