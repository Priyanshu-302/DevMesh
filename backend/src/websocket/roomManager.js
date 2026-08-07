const logger = require("../utils/logger");

/**
 * Generate a unique room name
 */
const getTaskRoomName = (taskId) => `task_${taskId}`;

/**
 * Join the task room
 */
const joinTaskRoom = (socket, taskId) => {
  const roomName = getTaskRoomName(taskId);

  socket.join(roomName);

  logger.info(`Client [${socket.id}] joined task room [${roomName}]`);
};

/**
 * Leave the task room
 */
const leaveTaskRoom = (socket, taskId) => {
  const roomName = getTaskRoomName(taskId);

  socket.leave(taskId);

  logger.info(`Client [${socket.id}] left task room [${roomName}]`);
};

module.exports = {
  getTaskRoomName,
  joinTaskRoom,
  leaveTaskRoom,
};
