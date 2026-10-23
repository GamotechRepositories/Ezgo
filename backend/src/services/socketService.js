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

    // Join admin room for administrative push notifications & live monitoring
    socket.on('join:admin', () => {
      socket.join('admin:room');
      console.log(`🛡️ Socket ${socket.id} joined room admin:room`);
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
  io.to('admin:room').emit('bid:placed', payload);
  if (payload.requirementId) {
    io.to(`req:${payload.requirementId}`).emit(`bid:placed:${payload.requirementId}`, payload);
  }
};

export const broadcastRequirementCreated = (requirement) => {
  if (!io) return;
  io.emit('requirement:created', requirement);
  io.to('admin:room').emit('requirement:created', requirement);
};

export const broadcastRequirementUpdated = (requirement) => {
  if (!io) return;
  io.emit('requirement:updated', requirement);
  io.to('admin:room').emit('requirement:updated', requirement);
  const reqId = requirement._id ? String(requirement._id) : String(requirement);
  if (reqId) {
    io.to(`req:${reqId}`).emit(`requirement:updated:${reqId}`, requirement);
  }
};

export const broadcastBookingCreated = (booking) => {
  if (!io) return;
  io.emit('booking:created', booking);
  io.to('admin:room').emit('booking:created', booking);

  const reqId = booking.requesterId?._id ? String(booking.requesterId._id) : (booking.requesterId ? String(booking.requesterId) : null);
  const provId = booking.providerId?._id ? String(booking.providerId._id) : (booking.providerId ? String(booking.providerId) : null);

  if (reqId) {
    io.to(`user:${reqId}`).emit('booking:update', booking);
    io.to(`user:${reqId}`).emit('booking:created', booking);
  }
  if (provId) {
    io.to(`user:${provId}`).emit('booking:update', booking);
    io.to(`user:${provId}`).emit('booking:created', booking);
  }
};

export const broadcastBookingUpdated = (booking) => {
  if (!io) return;
  io.emit('booking:updated', booking);
  io.to('admin:room').emit('booking:updated', booking);

  const reqId = booking.requesterId?._id ? String(booking.requesterId._id) : (booking.requesterId ? String(booking.requesterId) : null);
  const provId = booking.providerId?._id ? String(booking.providerId._id) : (booking.providerId ? String(booking.providerId) : null);

  if (reqId) {
    io.to(`user:${reqId}`).emit('booking:update', booking);
    io.to(`user:${reqId}`).emit('booking:updated', booking);
  }
  if (provId) {
    io.to(`user:${provId}`).emit('booking:update', booking);
    io.to(`user:${provId}`).emit('booking:updated', booking);
  }
};

export const broadcastDisputeRaised = ({ booking, disputeReason, raisedBy }) => {
  if (!io) return;
  const payload = { booking, disputeReason, raisedBy, timestamp: new Date() };
  io.to('admin:room').emit('dispute:raised', payload);
  broadcastBookingUpdated(booking);
};

export const broadcastDisputeResolved = ({ booking, action }) => {
  if (!io) return;
  const payload = { booking, action, timestamp: new Date() };
  io.to('admin:room').emit('dispute:resolved', payload);
  broadcastBookingUpdated(booking);
};

export const broadcastKycUpdated = (payload) => {
  if (!io) return;
  io.to('admin:room').emit('kyc:updated', payload);
  if (payload.providerId) {
    io.to(`user:${String(payload.providerId)}`).emit('kyc:status', payload);
  }
};

export const broadcastNotification = (userId, notification) => {
  if (!io || !userId) return;
  io.to(`user:${String(userId)}`).emit('notification:new', notification);
};
