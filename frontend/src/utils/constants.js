export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  WORKSPACE: '/workspace/:id',
  LIVE_TASK: '/workspace/:workspaceId/task/:taskId',
};

export const AGENT_COLORS = {
  architect: '#5b7cfa',
  developer: '#ff6b2b',
  qa:        '#f5c518',
  system:    '#00ff41',
};

export const TASK_STATUS = {
  PENDING:   'pending',
  RUNNING:   'running',
  COMPLETED: 'completed',
  FAILED:    'failed',
};
