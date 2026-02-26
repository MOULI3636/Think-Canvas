import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import Chat from './Chat';
import Participants from './Participants';
import MeetingControls from './MeetingControls';
// import NotesManager from './NotesManager';  // REMOVE THIS LINE
import api from '../../services/api';

const Whiteboard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket || !roomId || !user) return;

    console.log('Joining room:', roomId);
    socket.emit('join-room', { 
      roomId, 
      userId: user._id, 
      name: user.name 
    });

    const fetchRoomDetails = async () => {
      try {
        const response = await api.get(`/rooms/${roomId}`);
        setRoom(response.data);
        setIsHost(response.data.host?._id === user?._id);
        setIsLocked(response.data.isLocked || false);
      } catch (error) {
        console.error('Error fetching room:', error);
        setError('Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();

    // Socket event listeners
    const handleParticipantsUpdate = (updatedParticipants) => {
      console.log('Participants updated:', updatedParticipants);
      setParticipants(updatedParticipants || []);
    };

    const handleUserJoined = (data) => {
      console.log('User joined:', data);
    };

    const handleUserLeft = (data) => {
      console.log('User left:', data);
    };

    const handleRoomLockToggled = ({ isLocked }) => {
      setIsLocked(isLocked);
    };

    const handleRoomLocked = () => {
      alert('Room has been locked by host');
    };

    const handleRemovedFromRoom = () => {
      alert('You have been removed from the room');
      navigate('/');
    };

    const handleError = ({ message }) => {
      alert(`Error: ${message}`);
    };

    socket.on('participants-update', handleParticipantsUpdate);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('room-lock-toggled', handleRoomLockToggled);
    socket.on('room-locked', handleRoomLocked);
    socket.on('removed-from-room', handleRemovedFromRoom);
    socket.on('error', handleError);

    return () => {
      socket.off('participants-update', handleParticipantsUpdate);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('room-lock-toggled', handleRoomLockToggled);
      socket.off('room-locked', handleRoomLocked);
      socket.off('removed-from-room', handleRemovedFromRoom);
      socket.off('error', handleError);
    };
  }, [socket, roomId, user, navigate]);

  const handleToolChange = useCallback((newTool) => {
    console.log('Tool changed:', newTool);
  }, []);

  const handleColorChange = useCallback((newColor) => {
    console.log('Color changed:', newColor);
  }, []);

  const handleBrushSizeChange = useCallback((newSize) => {
    console.log('Brush size changed:', newSize);
  }, []);

  const handleClear = useCallback(() => {
    if (socket && window.confirm('Clear the entire board?')) {
      socket.emit('clear-board', { roomId });
    }
  }, [socket, roomId]);

  const handleLockToggle = useCallback(() => {
    if (socket) {
      console.log('Toggling lock:', !isLocked);
      socket.emit('toggle-room-lock', { roomId, lock: !isLocked });
    }
  }, [socket, roomId, isLocked]);

  const handleRemoveParticipant = useCallback((userId) => {
    if (window.confirm('Remove this participant?')) {
      console.log('Removing participant:', userId);
      socket.emit('remove-participant', { roomId, userId });
    }
  }, [socket, roomId]);

  const handleLeaveRoom = useCallback(() => {
    if (window.confirm('Leave this room?')) {
      navigate('/');
    }
  }, [navigate]);

  const handleToggleChat = useCallback(() => {
    console.log('Toggling chat:', !showChat);
    setShowChat(prev => !prev);
  }, []);

  const handleToggleParticipants = useCallback(() => {
    console.log('Toggling participants:', !showParticipants);
    setShowParticipants(prev => !prev);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen pt-16">
      {/* Main Whiteboard Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        <Toolbar
          onToolChange={handleToolChange}
          onColorChange={handleColorChange}
          onBrushSizeChange={handleBrushSizeChange}
          onUndo={() => window.__canvasActions?.undo()}
          onRedo={() => window.__canvasActions?.redo()}
          onClear={handleClear}
          onSave={() => console.log('Save')}
          onDownload={() => console.log('Download')}
          onUpload={() => console.log('Upload')}
          onPrint={() => console.log('Print')}
          onToggleChat={handleToggleChat}
          onToggleParticipants={handleToggleParticipants}
          isHost={isHost}
          showChat={showChat}
          showParticipants={showParticipants}
        />
        
        <div className="flex-1 relative">
          <Canvas
            roomId={roomId}
            socket={socket}
            isHost={isHost}
          />
        </div>

        <MeetingControls
          roomId={roomId}
          isHost={isHost}
          isLocked={isLocked}
          participantCount={participants.length}
          onLockToggle={handleLockToggle}
          onLeave={handleLeaveRoom}
        />
      </div>

      {/* Right Sidebar - Participants and Chat */}
      <div className="flex">
        {showParticipants && (
          <Participants
            participants={participants}
            isHost={isHost}
            onRemoveParticipant={handleRemoveParticipant}
          />
        )}

        {showChat && (
          <Chat
            roomId={roomId}
            socket={socket}
            user={user}
          />
        )}
      </div>
      
      {/* REMOVED: <NotesManager ... /> */}
    </div>
  );
};

export default Whiteboard;