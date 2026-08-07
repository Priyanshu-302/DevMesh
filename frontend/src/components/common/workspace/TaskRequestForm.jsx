import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../../../api/taskApi';
import Button from '../Button';

export default function TaskRequestForm({ workspaceId }) {
  const navigate = useNavigate();
  const [requestText, setRequestText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const { data } = await taskApi.create(workspaceId, { requestText });
      navigate(`/workspace/${workspaceId}/task/${data._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create task. Is the codebase uploaded?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label className="dm-label" htmlFor="task-prompt">Task Prompt / Instructions</label>
        <textarea
          id="task-prompt" required className="dm-textarea"
          rows={6}
          placeholder="Describe the task or feature you want the agents to build in detail (minimum 5 characters)…"
          value={requestText}
          onChange={e => setRequestText(e.target.value)}
        />
      </div>
      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)' }}>⚠ {error}</p>
      )}
      <Button type="submit" disabled={loading} style={{ width: '100%' }}>
        {loading ? '⟳ Dispatching agents…' : '⚡ Run Agents'}
      </Button>
    </form>
  );
}
