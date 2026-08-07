import axiosClient from './axiosClient';

export const codebaseApi = {
  upload: (workspaceId, formData) =>
    axiosClient.post(`/api/workspaces/${workspaceId}/codebase/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStatus: (workspaceId) =>
    axiosClient.get(`/api/workspaces/${workspaceId}/codebase/status`),
  saveFileContent: (workspaceId, filePath, content) =>
    axiosClient.post(`/api/workspaces/${workspaceId}/codebase/file`, { filePath, content }),
};
