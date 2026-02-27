import React from 'react';
import { FiLock, FiUnlock, FiLogOut, FiUsers, FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiXCircle } from 'react-icons/fi';

const MeetingControls = ({
  roomId,
  isHost,
  isLocked,
  onLockToggle,
  onLeave,
  participantCount,
  isMicEnabled,
  isVideoEnabled,
  isScreenSharing
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <FiUsers className="text-gray-500" />
          <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
        </div>

        <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          Room: {roomId}
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300">
          {isMicEnabled ? <FiMic /> : <FiMicOff />}
          <span>{isMicEnabled ? 'Mic on' : 'Mic off'}</span>
          {isVideoEnabled ? <FiVideo /> : <FiVideoOff />}
          <span>{isVideoEnabled ? 'Camera on' : 'Camera off'}</span>
          {isScreenSharing ? <FiMonitor /> : <FiXCircle />}
          <span>{isScreenSharing ? 'Sharing screen' : 'Not sharing screen'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {isHost && (
          <button
            onClick={onLockToggle}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition ${
              isLocked
                ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
            }`}
          >
            {isLocked ? <FiLock size={16} /> : <FiUnlock size={16} />}
            <span className="text-sm">{isLocked ? 'Locked' : 'Unlocked'}</span>
          </button>
        )}

        <button
          onClick={onLeave}
          className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <FiLogOut size={16} />
          <span className="text-sm">Leave</span>
        </button>
      </div>
    </div>
  );
};

export default MeetingControls;

