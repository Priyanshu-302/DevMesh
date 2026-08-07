import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workspaceApi } from '../api/workspaceApi';
import { taskApi } from '../api/taskApi';
import { codebaseApi } from '../api/codebaseApi';
import CodebaseUploader from '../components/common/workspace/CodebaseUploader';
import TaskRequestForm from '../components/common/workspace/TaskRequestForm';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import { formatDateTime, timeAgo } from '../utils/formatDate';

export default function WorkspacePage() {
  const { id } = useParams();
  const [workspace, setWorkspace]     = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [codebaseStatus, setCodebaseStatus] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [tab, setTab]                 = useState('tasks'); // 'tasks' | 'upload' | 'new-task'

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wsRes, tasksRes, cbRes] = await Promise.all([
        workspaceApi.getById(id),
        taskApi.listForWorkspace(id),
        codebaseApi.getStatus(id),
      ]);
      setWorkspace(wsRes.data);
      setTasks(tasksRes.data);
      setCodebaseStatus(cbRes.data?.status);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load workspace.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="page-content"><Loader label="Loading workspace…" /></div>;
  if (error) return <div className="page-content" style={{ fontFamily:'var(--font-mono)', color:'var(--red)' }}>⚠ {error}</div>;
  if (!workspace) return <div className="page-content" style={{ fontFamily:'var(--font-mono)', color:'var(--red)' }}>Workspace not found.</div>;

  const TABS = [
    { key: 'tasks',    label: 'Task History' },
    { key: 'upload',   label: 'Upload Codebase' },
    { key: 'new-task', label: '⚡ Run Agents' },
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', marginBottom:8 }}>
          <Link to="/dashboard" style={{ color:'var(--orange)' }}>dashboard</Link>
          <span style={{ margin:'0 8px' }}>/</span>
          {workspace.name}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <h1 className="font-display" style={{ fontSize:26, fontWeight:800, textTransform:'uppercase' }}>
            {workspace.name}
          </h1>
          <StatusBadge status={codebaseStatus === 'ready' ? 'active' : 'idle'} />
        </div>
        {workspace.description && (
          <p style={{ color:'var(--muted)', fontSize:14, marginTop:8 }}>{workspace.description}</p>
        )}
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)', marginTop:8 }}>
          Codebase: <span style={{ color: codebaseStatus === 'ready' ? 'var(--green)' : 'var(--yellow)' }}>
            {codebaseStatus || 'not uploaded'}
          </span>
        </div>
      </div>

      {/* Hazard divider */}
      <div className="hazard-stripe" style={{ height:2, marginBottom:28, borderRadius:1 }} />

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:28 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`btn btn-${tab === t.key ? 'primary' : 'outline'}`}
            style={{ fontSize:11, padding:'8px 18px' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'upload' && (
        <div className="glass-panel" style={{ padding:28, maxWidth:520 }}>
          <h2 className="font-display" style={{ fontSize:14, fontWeight:800, textTransform:'uppercase', marginBottom:20 }}>
            Upload Codebase
          </h2>
          <CodebaseUploader workspaceId={id} onUploaded={load} />
        </div>
      )}

      {tab === 'new-task' && (
        <div className="glass-panel" style={{ padding:28, maxWidth:520 }}>
          <h2 className="font-display" style={{ fontSize:14, fontWeight:800, textTransform:'uppercase', marginBottom:20 }}>
            New Agent Task
          </h2>
          {codebaseStatus !== 'ready' ? (
            <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--yellow)' }}>
              ⚠ Please upload your codebase first before running agents.
            </p>
          ) : (
            <TaskRequestForm workspaceId={id} />
          )}
        </div>
      )}

      {tab === 'tasks' && (
        <div>
          <h2 className="font-display" style={{ fontSize:14, fontWeight:800, textTransform:'uppercase', marginBottom:20 }}>
            Task History
          </h2>
          {tasks.length === 0 ? (
            <div className="glass-panel" style={{ padding:32, textAlign:'center' }}>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--muted)' }}>
                No tasks yet. Run your first agent task above.
              </p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {tasks.map(task => (
                <Link key={task._id} to={`/workspace/${id}/task/${task._id}`} style={{ textDecoration:'none' }}>
                  <div className="glass-panel" style={{
                    padding:'16px 20px',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    borderLeft:'3px solid var(--panel-border)',
                    transition:'border-color 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderLeftColor='var(--orange)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(255,107,43,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderLeftColor='var(--panel-border)'; e.currentTarget.style.boxShadow=''; }}
                  >
                    <div>
                      <div className="font-display" style={{ fontSize:13, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>
                        {task.title}
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted)' }}>
                        {timeAgo(task.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
