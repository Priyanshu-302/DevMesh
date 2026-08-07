import { getSocket } from './socketClient';

export const taskSocket = {
  joinTaskRoom(taskId) {
    getSocket()?.emit('join_task_room', { taskId });
  },
  leaveTaskRoom(taskId) {
    getSocket()?.emit('leave_task_room', { taskId });
  },
};
