const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");
const roomManager = require("./roomManager");
const logger = require("../utils/logger");

let io = null;

/**
 * Initialize the Socket.io server
 *
 * @param {Object} server - Node server
 * @returns {Object} Socket.io server instance
 */
const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Connection handshake middleware
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      if (token && token.startsWith("Bearer ")) {
        token = token.slice(7);
      }

      if (!token) {
        logger.warn(
          `WS connection rejected: Token missing from client [${socket.id}]`,
        );

        return next(new Error("Authentication error: JWT token is missing"));
      }

      // Check token is blacklisted or not
      const isBlacklisted = await TokenBlacklist.findOne({ token });
      if (isBlacklisted) {
        logger.warn(
          `WS connection rejected: Blacklisted token from client [${socket.id}]`,
        );
        return next(
          new Error("Authentication error: Token is invalidated (logged out)"),
        );
      }

      // verify token
      const decoded = jwt.verify(token, env.JWT_SECRET);

      // find user
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error("Authentication error: User no longer exists"));
      }

      // attach user to socket
      socket.user = user;
      socket.token = token;
      next();
    } catch (err) {
      logger.error(
        `WS authentication failed for client [${socket.id}]: ${err.message}`,
      );
      return next(
        new Error("Authentication error: Invalid or expired JWT token"),
      );
    }
  });

  // connection event
  io.on("connection", (socket) => {
    logger.info(
      `WebSocket client connected: ${socket.id} (User: ${socket.user.name})`,
    );

    // join room
    socket.on("join_room", (data) => {
      const { taskId } = data || {};
      if (!taskId) {
        socket.emit("error_message", {
          message: "taskId is required to join a room",
        });
        return;
      }

      roomManager.joinTaskRoom(socket, taskId);
    });

    // leave room
    socket.on("leave_room", (data) => {
      const { taskId } = data || {};
      if (!taskId) return;

      roomManager.leaveTaskRoom(socket, taskId);
    });

    socket.on("disconnect", () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Broadcast event to room
 *
 * @param {string} taskId - The target task ID
 * @param {string} eventType - The socket event identifier (e.g. 'developer_code_chunk')
 * @param {Object} payload - The event payload
 */
const broadcastToTaskRoom = (taskId, eventType, payload) => {
  if (!io) {
    logger.error("Cannot broadcast: Socket.io server has not been initialized");
    return;
  }

  const roomName = roomManager.getTaskRoomName(taskId);
  logger.info(`WS Broadcast: '${eventType}' to room '${roomName}'`);

  // Emits the payload
  io.to(roomName).emit(eventType, {
    data: payload,
  });
};

module.exports = { initSocketServer, broadcastToTaskRoom };
