module.exports = (io) => {
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('join-room', ({ roomId, userId, name }) => {
      console.log(`👤 ${name} (${userId}) joining room:`, roomId);

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.userName = name;

      // Store room data
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          participants: new Map(),
          isLocked: false,
          hostId: userId
        });
      }

      const roomData = rooms.get(roomId);
      roomData.participants.set(userId, { 
        name, 
        socketId: socket.id,
        isHost: userId === roomData.hostId
      });

      // Send participants list
      const participants = [];
      roomData.participants.forEach((value, key) => {
        participants.push({
          id: key,
          name: value.name,
          isHost: key === roomData.hostId
        });
      });
      
      io.to(roomId).emit('participants-update', participants);
      socket.to(roomId).emit('user-joined', { userId, name });
    });

    // Drawing events - just broadcast to everyone except sender
    socket.on('draw', (data) => {
      socket.to(data.roomId).emit('draw', data);
    });

    socket.on('begin-path', (data) => {
      socket.to(data.roomId).emit('begin-path', data);
    });

    socket.on('clear-board', ({ roomId }) => {
      io.to(roomId).emit('clear-board');
    });

    // Chat events
    socket.on('send-message', (data) => {
      io.to(data.roomId).emit('new-message', {
        ...data,
        id: Date.now() + Math.random()
      });
    });

    socket.on('typing', ({ roomId, userId, name, isTyping }) => {
      socket.to(roomId).emit('user-typing', { userId, name, isTyping });
    });

    // Room lock
    socket.on('toggle-room-lock', ({ roomId, lock }) => {
      const roomData = rooms.get(roomId);
      if (roomData && roomData.hostId === socket.data.userId) {
        roomData.isLocked = lock;
        io.to(roomId).emit('room-lock-toggled', { isLocked: lock });
      }
    });

    // Remove participant
    socket.on('remove-participant', ({ roomId, userId }) => {
      const roomData = rooms.get(roomId);
      if (!roomData || roomData.hostId !== socket.data.userId) return;

      roomData.participants.delete(userId);
      
      const participants = [];
      roomData.participants.forEach((value, key) => {
        participants.push({
          id: key,
          name: value.name,
          isHost: key === roomData.hostId
        });
      });
      
      io.to(roomId).emit('participants-update', participants);
      
      // Find and remove the user
      const sockets = io.sockets.sockets;
      sockets.forEach((s) => {
        if (s.data.userId === userId && s.data.roomId === roomId) {
          s.emit('removed-from-room');
          s.leave(roomId);
        }
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
      
      const roomId = socket.data.roomId;
      const userId = socket.data.userId;

      if (roomId && rooms.has(roomId)) {
        const roomData = rooms.get(roomId);
        roomData.participants.delete(userId);
        
        if (roomData.participants.size === 0) {
          rooms.delete(roomId);
        } else {
          const participants = [];
          roomData.participants.forEach((value, key) => {
            participants.push({
              id: key,
              name: value.name,
              isHost: key === roomData.hostId
            });
          });
          
          io.to(roomId).emit('participants-update', participants);
          io.to(roomId).emit('user-left', { userId });
        }
      }
    });
  });
};