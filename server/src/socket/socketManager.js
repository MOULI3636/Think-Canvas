module.exports = (io) => {
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', ({ roomId, userId, name }) => {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.userName = name;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          participants: new Map(),
          isLocked: false,
          hostId: userId,
          canvasSnapshot: '',
          sharedFiles: [],
          screenShares: new Map()
        });
      }

      const roomData = rooms.get(roomId);
      roomData.participants.set(userId, {
        name,
        socketId: socket.id,
        isHost: userId === roomData.hostId
      });

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

      if (roomData.canvasSnapshot) {
        socket.emit('sync-canvas-state', { imageData: roomData.canvasSnapshot });
      }

      socket.emit('whiteboard-files', roomData.sharedFiles || []);

      const currentShares = [];
      roomData.screenShares.forEach((share, shareUserId) => {
        currentShares.push({
          userId: shareUserId,
          name: share.name,
          frame: share.frame || ''
        });
      });
      socket.emit('screen-share-state', currentShares);
    });

    socket.on('draw', (data) => {
      socket.to(data.roomId).emit('draw', data);
    });

    socket.on('begin-path', (data) => {
      socket.to(data.roomId).emit('begin-path', data);
    });

    socket.on('sync-canvas-state', ({ roomId, imageData }) => {
      const roomData = rooms.get(roomId);
      if (!roomData) return;
      roomData.canvasSnapshot = imageData || '';
      socket.to(roomId).emit('sync-canvas-state', { imageData: roomData.canvasSnapshot });
    });

    socket.on('request-canvas-state', ({ roomId }) => {
      const roomData = rooms.get(roomId);
      if (!roomData?.canvasSnapshot) return;
      socket.emit('sync-canvas-state', { imageData: roomData.canvasSnapshot });
    });

    socket.on('whiteboard-file-uploaded', ({ roomId, fileMeta }) => {
      const roomData = rooms.get(roomId);
      if (!roomData || roomData.hostId !== socket.data.userId) return;
      if (!fileMeta?.id || !fileMeta?.name || !fileMeta?.dataUrl) return;

      roomData.sharedFiles = [fileMeta, ...(roomData.sharedFiles || [])].slice(0, 25);
      io.to(roomId).emit('whiteboard-file-uploaded', fileMeta);
    });

    socket.on('start-screen-share', ({ roomId }) => {
      const roomData = rooms.get(roomId);
      if (!roomData || !socket.data.userId) return;

      roomData.screenShares.set(socket.data.userId, {
        name: socket.data.userName || 'Participant',
        frame: ''
      });

      io.to(roomId).emit('screen-share-started', {
        userId: socket.data.userId,
        name: socket.data.userName || 'Participant'
      });
    });

    socket.on('screen-share-frame', ({ roomId, frame }) => {
      const roomData = rooms.get(roomId);
      if (!roomData || !socket.data.userId || !frame) return;

      const shareState = roomData.screenShares.get(socket.data.userId);
      if (!shareState) return;

      shareState.frame = frame;
      roomData.screenShares.set(socket.data.userId, shareState);

      socket.to(roomId).emit('screen-share-frame', {
        userId: socket.data.userId,
        name: shareState.name,
        frame
      });
    });

    socket.on('stop-screen-share', ({ roomId }) => {
      const roomData = rooms.get(roomId);
      if (!roomData || !socket.data.userId) return;

      roomData.screenShares.delete(socket.data.userId);
      io.to(roomId).emit('screen-share-stopped', { userId: socket.data.userId });
    });

    socket.on('send-reaction', ({ roomId, emoji }) => {
      if (!emoji || !roomId) return;
      io.to(roomId).emit('whiteboard-reaction', {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        emoji,
        userId: socket.data.userId,
        name: socket.data.userName || 'Participant',
        createdAt: new Date().toISOString()
      });
    });

    socket.on('clear-board', ({ roomId }) => {
      const roomData = rooms.get(roomId);
      if (roomData) {
        roomData.canvasSnapshot = '';
      }
      io.to(roomId).emit('clear-board');
    });

    socket.on('send-message', (data) => {
      io.to(data.roomId).emit('new-message', {
        ...data,
        id: Date.now() + Math.random()
      });
    });

    socket.on('typing', ({ roomId, userId, name, isTyping }) => {
      socket.to(roomId).emit('user-typing', { userId, name, isTyping });
    });

    socket.on('toggle-room-lock', ({ roomId, lock }) => {
      const roomData = rooms.get(roomId);
      if (roomData && roomData.hostId === socket.data.userId) {
        roomData.isLocked = lock;
        io.to(roomId).emit('room-lock-toggled', { isLocked: lock });
      }
    });

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

      const sockets = io.sockets.sockets;
      sockets.forEach((s) => {
        if (s.data.userId === userId && s.data.roomId === roomId) {
          s.emit('removed-from-room');
          s.leave(roomId);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      const roomId = socket.data.roomId;
      const userId = socket.data.userId;

      if (roomId && rooms.has(roomId)) {
        const roomData = rooms.get(roomId);
        roomData.participants.delete(userId);

        if (roomData.screenShares.has(userId)) {
          roomData.screenShares.delete(userId);
          io.to(roomId).emit('screen-share-stopped', { userId });
        }

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
