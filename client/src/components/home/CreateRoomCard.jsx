import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiVideo, FiUsers, FiLock, FiUnlock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateRoomCard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState('');

  const handleCreateRoom = async () => {
    if (!isAuthenticated) {
      googleLogin();
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/rooms/create', {
        name: roomName || undefined
      });
      
      if (response.data.success) {
        toast.success('Room created successfully!');
        navigate(`/room/${response.data.room.roomId}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition duration-300">
      <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Meeting
          </h2>
          <FiVideo className="text-4xl text-blue-600" />
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start a new collaborative session instantly. Share the room code with participants to join.
        </p>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Room name (optional)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <FiUsers />
            <span>Up to 50 participants</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <FiLock />
            <span>Room can be locked by host</span>
          </div>
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Room & Start Meeting'}
        </button>
      </div>
    </div>
  );
};

export default CreateRoomCard;