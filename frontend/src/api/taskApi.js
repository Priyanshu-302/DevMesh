import axiosClient from './axiosClient';

export const taskApi = {
  create:           (workspaceId, payload) => axiosClient.post(`/api/workspaces/${workspaceId}/tasks`, payload),
  getById:          (taskId)               => axiosClient.get(`/api/tasks/${taskId}`),
  listForWorkspace: (workspaceId)          => axiosClient.get(`/api/workspaces/${workspaceId}/tasks`),
  getLogs:          (taskId)               => axiosClient.get(`/api/tasks/${taskId}/logs`),
  createFollowUp:   (taskId, payload)      => axiosClient.post(`/api/tasks/${taskId}/followup`, payload),
};
