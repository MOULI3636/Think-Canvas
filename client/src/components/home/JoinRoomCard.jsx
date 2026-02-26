import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const JoinRoomCard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, googleLogin } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      googleLogin();
      return;
    }

    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    const formattedRoomCode = roomCode.trim().toUpperCase();
    
    setLoading(true);
    try {
      const response = await api.post('/rooms/join', {
        roomId: formattedRoomCode
      });
      
      if (response.data.success) {
        toast.success('Joined room successfully!');
        navigate(`/room/${formattedRoomCode}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      if (error.response?.status === 403) {
        toast.error('Room is locked');
      } else if (error.response?.status === 404) {
        toast.error('Room not found');
      } else {
        toast.error('Failed to join room');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition duration-300">
      <div className="h-2 bg-gradient-to-r from-green-600 to-teal-600"></div>
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join Meeting
          </h2>
          <FiLogIn className="text-4xl text-green-600" />
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Enter the room code provided by the host to join an existing session.
        </p>

        <form onSubmit={handleJoinRoom} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-2xl font-mono"
            maxLength="6"
          />

          <button
            type="submit"
            disabled={loading || roomCode.length !== 6}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Meeting'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Example codes: ABC123, XYZ789
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomCard;