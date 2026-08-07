import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../../../api/taskApi';
import Button from '../Button';

export default function TaskRequestForm({ workspaceId }) {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const { data } = await taskApi.create(workspaceId, form);
      navigate(`/workspace/${workspaceId}/task/${data._id}`);
    } catch {
      setError('Failed to create task. Is the codebase uploaded?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label className="dm-label" htmlFor="task-title">Task Title</label>
        <input
          id="task-title" required className="dm-input"
          placeholder="e.g. Add JWT refresh token logic"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <label className="dm-label" htmlFor="task-desc">Description</label>
        <textarea
          id="task-desc" required className="dm-textarea"
          placeholder="Describe the feature or bug in detail…"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
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
