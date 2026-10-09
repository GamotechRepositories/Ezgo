import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`⚡ WebSocket client connected [ID: ${socket.id}]`);

    // Join specific user room for targeted notifications
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${String(userId)}`);
        console.log(`👤 Socket ${socket.id} joined room user:${userId}`);
      }
    });

    // Join specific requirement room for live bids
    socket.on('join:requirement', (requirementId) => {
      if (requirementId) {
        socket.join(`req:${String(requirementId)}`);
        console.log(`📦 Socket ${socket.id} joined room req:${requirementId}`);
      }
    });

    socket.on('leave:requirement', (requirementId) => {
      if (requirementId) {
        socket.leave(`req:${String(requirementId)}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket client disconnected [ID: ${socket.id}, reason: ${reason}]`);
    });
  });

  return io;
};

export const getIO = () => io;

// Real-time broadcast events
export const broadcastBidPlaced = (payload) => {
  if (!io) return;
  // Global event for live bidding counters, latest lowest bids, and active cards
  io.emit('bid:placed', payload);
  if (payload.requirementId) {
    io.to(`req:${payload.requirementId}`).emit(`bid:placed:${payload.requirementId}`, payload);
  }
};

export const broadcastRequirementCreated = (requirement) => {
  if (!io) return;
  io.emit('requirement:created', requirement);
};

export const broadcastRequirementUpdated = (requirement) => {
  if (!io) return;
  io.emit('requirement:updated', requirement);
  if (requirement._id) {
    io.to(`req:${requirement._id}`).emit(`requirement:updated:${requirement._id}`, requirement);
  }
};

export const broadcastBookingCreated = (booking) => {
  if (!io) return;
  io.emit('booking:created', booking);
  if (booking.requesterId) {
    io.to(`user:${booking.requesterId}`).emit('booking:update', booking);
  }
  if (booking.providerId) {
    const provId = typeof booking.providerId === 'object' ? booking.providerId._id : booking.providerId;
    io.to(`user:${provId}`).emit('booking:update', booking);
  }
};

export const broadcastBookingUpdated = (booking) => {
  if (!io) return;
  io.emit('booking:updated', booking);
  if (booking.requesterId) {
    const reqId = typeof booking.requesterId === 'object' ? booking.requesterId._id : booking.requesterId;
    io.to(`user:${reqId}`).emit('booking:update', booking);
  }
  if (booking.providerId) {
    const provId = typeof booking.providerId === 'object' ? booking.providerId._id : booking.providerId;
    io.to(`user:${provId}`).emit('booking:update', booking);
  }
};
