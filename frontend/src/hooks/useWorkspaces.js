import { useState, useEffect, useCallback } from 'react';
import { workspaceApi } from '../api/workspaceApi';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await workspaceApi.list();
      setWorkspaces(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch workspaces.');
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createWorkspace = async (payload) => {
    const { data } = await workspaceApi.create(payload);
    setWorkspaces(prev => [data, ...prev]);
    return data;
  };

  const removeWorkspace = async (id) => {
    await workspaceApi.remove(id);
    setWorkspaces(prev => prev.filter(w => w._id !== id));
  };

  return { workspaces, loading, error, refetch: fetch, createWorkspace, removeWorkspace };
}

