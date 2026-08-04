import { useState, useEffect, useCallback } from 'react';
import { workspaceApi } from '../api/workspaceApi';

/* ── Dev mock workspaces (used when no backend is running) ── */
const DEV_MOCK_WORKSPACES = [
  {
    _id: 'demo-workspace-1',
    name: 'DevMesh Auth & Session Microservice',
    description: 'Node.js & TypeScript authentication module with JWT session management.',
    codebaseStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    taskCount: 4,
  },
  {
    _id: 'demo-workspace-2',
    name: 'Python Analytics & Agent Pipeline',
    description: 'FastAPI microservice for AST code parsing and multi-agent task execution.',
    codebaseStatus: 'ready',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    taskCount: 2,
  },
];

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await workspaceApi.list();
      setWorkspaces(data?.length ? data : DEV_MOCK_WORKSPACES);
    } catch {
      setWorkspaces(DEV_MOCK_WORKSPACES); // Fallback to mock data if backend offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createWorkspace = async (payload) => {
    try {
      const { data } = await workspaceApi.create(payload);
      setWorkspaces(prev => [data, ...prev]);
      return data;
    } catch {
      const mockNew = {
        _id: `mock-ws-${Date.now()}`,
        name: payload.name || 'New Workspace',
        description: payload.description || 'Dev mock workspace',
        codebaseStatus: 'ready',
        createdAt: new Date().toISOString(),
        taskCount: 0,
      };
      setWorkspaces(prev => [mockNew, ...prev]);
      return mockNew;
    }
  };

  const removeWorkspace = async (id) => {
    try {
      await workspaceApi.remove(id);
    } catch {}
    setWorkspaces(prev => prev.filter(w => w._id !== id));
  };

  return { workspaces, loading, error, refetch: fetch, createWorkspace, removeWorkspace };
}

