let io;

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    
    io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
      },
    });

    // Auth middleware
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.id).select('_id role name');
        if (!user) return next(new Error('User not found'));
        socket.user = user;
        next();
      } catch(err) {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      // Auto-join user room
      socket.join(`user:${socket.user._id}`);

      // Join ticket room
      socket.on('join-ticket', async ({ ticketId }) => {
        // Access control could be refined here
        socket.join(`ticket:${ticketId}`);
      });

      // Leave ticket room
      socket.on('leave-ticket', ({ ticketId }) => {
        socket.leave(`ticket:${ticketId}`);
      });

      // Typing indicator
      socket.on('chat:typing', ({ ticketId }) => {
        socket.to(`ticket:${ticketId}`).emit('chat:typing', { userId: socket.user._id });
      });

      socket.on('disconnect', () => {});
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
