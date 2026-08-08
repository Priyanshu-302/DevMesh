import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import { codebaseApi } from '../api/codebaseApi';
import { useTaskSocket } from '../hooks/useTaskSocket';
import AgentGraph     from '../components/common/agentVisualization/AgentGraph';
import AgentChatFeed  from '../components/common/agentVisualization/AgentChatFeed';
import FileDiffViewer from '../components/common/agentVisualization/FileDiffViewer';
import QaResultPanel  from '../components/common/agentVisualization/QaResultPanel';
import RetryLoopBadge from '../components/common/agentVisualization/RetryLoopBadge';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

export default function LiveTaskPage() {
  const { workspaceId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Code Editor states
  const [rhsTab, setRhsTab] = useState('diff'); // 'diff' | 'editor'
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [editedCode, setEditedCode] = useState('');
  const [savingFile, setSavingFile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Follow-up prompt states
  const [followUpPrompt, setFollowUpPrompt] = useState('');
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState(null);

  const { logs, status, qaResult, retryCount } = useTaskSocket(taskId, task?.status);

  useEffect(() => {
    taskApi.getById(taskId)
      .then(r => setTask(r.data))
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load task.'))
      .finally(() => setLoading(false));
  }, [taskId]);

  // Re-fetch task details when completed or failed to load finalCode
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      taskApi.getById(taskId)
        .then(r => setTask(r.data))
        .catch((err) => console.error('Failed to re-fetch completed task:', err));
    }
  }, [status, taskId]);

  // Fetch actual files in the workspace codebase
  const [codebaseFiles, setCodebaseFiles] = useState({});

  useEffect(() => {
    if (workspaceId) {
      codebaseApi.getCodebaseFiles(workspaceId)
        .then(res => {
          if (res.data?.files) {
            setCodebaseFiles(res.data.files);
          }
        })
        .catch(err => console.error('Failed to fetch codebase files:', err));
    }
  }, [workspaceId, status]); // Re-fetch on workspace load, and when task status updates (e.g. finishes)

  const filePaths = Object.keys(codebaseFiles);

  // Sync selected file and edited code when codebase files load or change
  useEffect(() => {
    if (filePaths.length > 0) {
      if (!selectedFilePath || !filePaths.includes(selectedFilePath)) {
        setSelectedFilePath(filePaths[0]);
        setEditedCode(codebaseFiles[filePaths[0]] || '');
      }
    }
  }, [codebaseFiles]);

  useEffect(() => {
    if (selectedFilePath && typeof codebaseFiles[selectedFilePath] !== 'undefined') {
      setEditedCode(codebaseFiles[selectedFilePath]);
      setSaveSuccess(false);
      setSaveError(null);
    }
  }, [selectedFilePath, codebaseFiles]);

  const handleSaveFile = async () => {
    setSavingFile(true); setSaveError(null); setSaveSuccess(false);
    try {
      await codebaseApi.saveFileContent(workspaceId, selectedFilePath, editedCode);
      setSaveSuccess(true);
      
      // Update our local state representation of the files
      setCodebaseFiles(prev => ({
        ...prev,
        [selectedFilePath]: editedCode
      }));
    } catch (err) {
      setSaveError(err?.response?.data?.message || err?.message || 'Failed to save changes.');
    } finally {
      setSavingFile(false);
    }
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpPrompt.trim()) return;
    setSubmittingFollowUp(true); setFollowUpError(null);
    try {
      const { data } = await taskApi.create(workspaceId, {
        requestText: followUpPrompt,
        parentTaskId: taskId
      });
      navigate(`/workspace/${workspaceId}/task/${data._id}`);
      setFollowUpPrompt('');
    } catch (err) {
      setFollowUpError(err?.response?.data?.message || err?.message || 'Failed to dispatch follow-up command.');
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  const displayLogs      = logs || [];
  const displayStatus    = status || 'pending';
  const displayQaResult  = qaResult || null;
  const displayRetry     = retryCount || 0;
  const isRunning        = displayStatus === 'pending' || displayStatus === 'in-progress';

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
            {task?.requestText ? (task.requestText.length > 50 ? task.requestText.substring(0, 47) + '...' : task.requestText) : 'Live Task'}
          </h1>
          {task?.requestText && (
            <p style={{ color:'var(--muted)', fontSize:13, marginTop:6, maxWidth:600, fontFamily:'var(--font-mono)' }}>
              Prompt: {task.requestText}
            </p>
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

      {/* 2-col grid: Chat + Input | Diff or Editor */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <AgentChatFeed logs={displayLogs} isRunning={isRunning} />
          
          {/* Follow-up Prompt Input Box */}
          {!isRunning && (
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 12 }}>
                Follow-up Command / New Prompt
              </div>
              <form onSubmit={handleFollowUpSubmit} style={{ display: 'flex', gap: 10 }}>
                <input
                  required
                  className="dm-input"
                  placeholder="e.g. Fix the negative calculation or add comments..."
                  value={followUpPrompt}
                  onChange={e => setFollowUpPrompt(e.target.value)}
                  disabled={submittingFollowUp}
                  style={{ flex: 1 }}
                />
                <Button type="submit" disabled={submittingFollowUp} style={{ padding: '0 20px', flexShrink: 0 }}>
                  {submittingFollowUp ? 'Sending…' : 'Send'}
                </Button>
              </form>
              {followUpError && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginTop: 8 }}>⚠ {followUpError}</p>
              )}
            </div>
          )}
        </div>

        {/* Right side: Diff / Editor toggle */}
        {rhsTab === 'diff' ? (
          <div style={{ position: 'relative' }}>
            <FileDiffViewer logs={displayLogs} />
            <button
              onClick={() => setRhsTab('editor')}
              className="btn btn-outline"
              style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, padding: '4px 10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}
            >
              ✎ Code Editor
            </button>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)' }}>
                Code Editor
              </div>
              <button
                onClick={() => setRhsTab('diff')}
                className="btn btn-outline"
                style={{ fontSize: 10, padding: '4px 10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}
              >
                💾 View Diff
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {filePaths.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                  No files modified yet…
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <label className="dm-label" style={{ marginBottom: 0, fontSize: 11, minWidth: 80 }}>Active File:</label>
                    <select
                      className="dm-input"
                      style={{ padding: '4px 8px', fontSize: 11, fontFamily: 'var(--font-mono)', width: 'auto', flex: 1 }}
                      value={selectedFilePath}
                      onChange={e => setSelectedFilePath(e.target.value)}
                    >
                      {filePaths.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Textarea Code Editor */}
                  <textarea
                    className="dm-textarea"
                    style={{
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: 12,
                      lineHeight: 1.6,
                      flex: 1,
                      background: 'rgba(10, 10, 14, 0.7)',
                      color: '#d4d4d4',
                      border: '1px solid var(--panel-border)',
                      borderRadius: 4,
                      padding: 12,
                      minHeight: 280,
                      resize: 'vertical'
                    }}
                    value={editedCode}
                    onChange={e => setEditedCode(e.target.value)}
                  />

                  {/* Save Status & Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      {saveSuccess && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)' }}>✓ Saved changes & updated RAG indices</span>
                      )}
                      {saveError && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)' }}>⚠ {saveError}</span>
                      )}
                    </div>
                    <Button onClick={handleSaveFile} disabled={savingFile} style={{ padding: '6px 14px', fontSize: 11 }}>
                      {savingFile ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QA Results — full width */}
      <QaResultPanel qaResult={displayQaResult} />
    </div>
  );
}

