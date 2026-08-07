import axiosClient from './axiosClient';

export const workspaceApi = {
  create:  (payload) => axiosClient.post('/api/workspaces', payload),
  list:    ()        => axiosClient.get('/api/workspaces'),
  getById: (id)      => axiosClient.get(`/api/workspaces/${id}`),
  remove:  (id)      => axiosClient.delete(`/api/workspaces/${id}`),
};
