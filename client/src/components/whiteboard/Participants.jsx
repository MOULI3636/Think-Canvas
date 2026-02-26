import React from 'react';
import { FiUser, FiStar, FiXCircle } from 'react-icons/fi';

const Participants = ({ participants, isHost, onRemoveParticipant }) => {
  console.log('Participants received:', participants); // Debug log

  if (!participants || participants.length === 0) {
    return (
      <div className="w-64 bg-white dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col h-full">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold flex items-center">
            <FiUser className="mr-2" />
            Participants (0)
          </h3>
        </div>
        <div className="flex-1 p-4 text-center text-gray-500">
          No participants yet
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="font-semibold flex items-center">
          <FiUser className="mr-2" />
          Participants ({participants.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {participants.map((participant, index) => (
            <div key={participant.id || index} className="flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center">
                    {participant.name || 'Unknown User'}
                    {participant.isHost && (
                      <FiStar className="ml-1 text-yellow-500" size={12} />
                    )}
                  </p>
                </div>
              </div>

              {isHost && !participant.isHost && (
                <button
                  onClick={() => onRemoveParticipant(participant.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600"
                  title="Remove participant"
                >
                  <FiXCircle size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Participants;