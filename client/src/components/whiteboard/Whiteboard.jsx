import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import Chat from './Chat';
import Participants from './Participants';
import MeetingControls from './MeetingControls';
import api from '../../services/api';

const Whiteboard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [isHost, setIsHost] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharedFiles, setSharedFiles] = useState([]);

  const [mediaStream, setMediaStream] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShares, setScreenShares] = useState({});
  const [reactionFeed, setReactionFeed] = useState([]);

  const localVideoRef = useRef(null);
  const screenShareVideoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const screenShareStreamRef = useRef(null);
  const frameIntervalRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream || null;
    }
  }, [mediaStream]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (screenShareStreamRef.current) {
        screenShareStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, [mediaStream]);

  useEffect(() => {
    if (!socket || !roomId || !user) return;

    socket.emit('join-room', {
      roomId,
      userId: user._id,
      name: user.name
    });

    const fetchRoomDetails = async () => {
      try {
        const response = await api.get(`/rooms/${roomId}`);
        setIsHost(response.data.host?._id === user?._id);
        setIsLocked(response.data.isLocked || false);
      } catch (fetchError) {
        setError('Failed to load room');
        console.error('Error fetching room:', fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();

    const handleParticipantsUpdate = (updatedParticipants) => {
      setParticipants(updatedParticipants || []);
    };

    const handleRoomLockToggled = ({ isLocked: locked }) => {
      setIsLocked(locked);
    };

    const handleRoomLocked = () => {
      alert('Room has been locked by host');
    };

    const handleRemovedFromRoom = () => {
      alert('You have been removed from the room');
      navigate('/');
    };

    const handleSocketError = ({ message }) => {
      alert(`Error: ${message}`);
    };

    const handleWhiteboardFiles = (files) => {
      setSharedFiles(files || []);
    };

    const handleWhiteboardFileUploaded = (fileMeta) => {
      setSharedFiles((prev) => {
        const exists = prev.some((item) => item.id === fileMeta.id);
        return exists ? prev : [fileMeta, ...prev];
      });
    };

    const handleScreenShareState = (shares) => {
      const next = {};
      (shares || []).forEach((share) => {
        next[share.userId] = { name: share.name, frame: share.frame || '' };
      });
      setScreenShares(next);
    };

    const handleScreenShareStarted = ({ userId, name }) => {
      setScreenShares((prev) => ({
        ...prev,
        [userId]: {
          name,
          frame: prev[userId]?.frame || ''
        }
      }));
    };

    const handleScreenShareFrame = ({ userId, name, frame }) => {
      if (!frame) return;
      setScreenShares((prev) => ({
        ...prev,
        [userId]: { name, frame }
      }));
    };

    const handleScreenShareStopped = ({ userId }) => {
      setScreenShares((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    };

    const handleReaction = (payload) => {
      setReactionFeed((prev) => [payload, ...prev].slice(0, 8));
      window.setTimeout(() => {
        setReactionFeed((prev) => prev.filter((item) => item.id !== payload.id));
      }, 3500);
    };

    socket.on('participants-update', handleParticipantsUpdate);
    socket.on('room-lock-toggled', handleRoomLockToggled);
    socket.on('room-locked', handleRoomLocked);
    socket.on('removed-from-room', handleRemovedFromRoom);
    socket.on('error', handleSocketError);
    socket.on('whiteboard-files', handleWhiteboardFiles);
    socket.on('whiteboard-file-uploaded', handleWhiteboardFileUploaded);
    socket.on('screen-share-state', handleScreenShareState);
    socket.on('screen-share-started', handleScreenShareStarted);
    socket.on('screen-share-frame', handleScreenShareFrame);
    socket.on('screen-share-stopped', handleScreenShareStopped);
    socket.on('whiteboard-reaction', handleReaction);

    return () => {
      socket.off('participants-update', handleParticipantsUpdate);
      socket.off('room-lock-toggled', handleRoomLockToggled);
      socket.off('room-locked', handleRoomLocked);
      socket.off('removed-from-room', handleRemovedFromRoom);
      socket.off('error', handleSocketError);
      socket.off('whiteboard-files', handleWhiteboardFiles);
      socket.off('whiteboard-file-uploaded', handleWhiteboardFileUploaded);
      socket.off('screen-share-state', handleScreenShareState);
      socket.off('screen-share-started', handleScreenShareStarted);
      socket.off('screen-share-frame', handleScreenShareFrame);
      socket.off('screen-share-stopped', handleScreenShareStopped);
      socket.off('whiteboard-reaction', handleReaction);
    };
  }, [socket, roomId, user, navigate]);

  const handleToolChange = useCallback((newTool) => {
    window.__canvasActions?.setTool?.(newTool);
  }, []);

  const handleColorChange = useCallback((newColor) => {
    window.__canvasActions?.setColor?.(newColor);
  }, []);

  const handleBrushSizeChange = useCallback((newSize) => {
    window.__canvasActions?.setBrushSize?.(newSize);
  }, []);

  const handleFillChange = useCallback((enabled) => {
    window.__canvasActions?.setFillEnabled?.(enabled);
  }, []);

  const handleFillColorChange = useCallback((nextColor) => {
    window.__canvasActions?.setFillColor?.(nextColor);
  }, []);

  const handleUndo = useCallback(() => {
    if (!isHost) return;
    window.__canvasActions?.undo?.();
    socket?.emit('sync-canvas-state', {
      roomId,
      imageData: window.__canvasActions?.getImageData?.() || ''
    });
  }, [isHost, socket, roomId]);

  const handleRedo = useCallback(() => {
    if (!isHost) return;
    window.__canvasActions?.redo?.();
    socket?.emit('sync-canvas-state', {
      roomId,
      imageData: window.__canvasActions?.getImageData?.() || ''
    });
  }, [isHost, socket, roomId]);

  const handleClear = useCallback(() => {
    if (!isHost || !socket) return;
    if (!window.confirm('Clear the entire board?')) return;
    window.__canvasActions?.clearCanvas?.();
    socket.emit('clear-board', { roomId });
  }, [isHost, socket, roomId]);

  const handleLockToggle = useCallback(() => {
    socket?.emit('toggle-room-lock', { roomId, lock: !isLocked });
  }, [socket, roomId, isLocked]);

  const handleRemoveParticipant = useCallback((userId) => {
    if (window.confirm('Remove this participant?')) {
      socket?.emit('remove-participant', { roomId, userId });
    }
  }, [socket, roomId]);

  const cleanupScreenShare = useCallback((emitStop = true) => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach((track) => track.stop());
      screenShareStreamRef.current = null;
    }

    if (emitStop) {
      socket?.emit('stop-screen-share', { roomId });
    }

    setIsScreenSharing(false);
  }, [socket, roomId]);

  const handleLeaveRoom = useCallback(() => {
    if (window.confirm('Leave this room?')) {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      cleanupScreenShare(true);
      navigate('/');
    }
  }, [navigate, mediaStream, cleanupScreenShare]);

  const handleToggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  const handleToggleParticipants = useCallback(() => {
    setShowParticipants((prev) => !prev);
  }, []);

  const broadcastCanvasSnapshot = useCallback(() => {
    socket?.emit('sync-canvas-state', {
      roomId,
      imageData: window.__canvasActions?.getImageData?.() || ''
    });
  }, [roomId, socket]);

  const buildFileMeta = useCallback((file, dataUrl, kind) => {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
      dataUrl,
      kind: kind || (file.type.startsWith('image/') ? 'image' : 'file'),
      uploadedBy: user?.name || 'Host',
      uploadedAt: new Date().toISOString()
    };
  }, [user?.name]);

  const publishFile = useCallback((fileMeta) => {
    setSharedFiles((prev) => [fileMeta, ...prev]);
    socket?.emit('whiteboard-file-uploaded', {
      roomId,
      fileMeta
    });
  }, [roomId, socket]);

  const handleUpload = useCallback(async (file) => {
    if (!isHost || !socket || !file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert('File is too large. Max size is 12MB.');
      return;
    }

    const readAsDataUrl = () => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const dataUrl = await readAsDataUrl();
      const payload = buildFileMeta(file, dataUrl);

      if (file.type.startsWith('image/')) {
        await window.__canvasActions?.insertImage?.(payload.dataUrl);
        broadcastCanvasSnapshot();
      }

      publishFile(payload);
    } catch (uploadError) {
      console.error('Upload failed:', uploadError);
      alert('Failed to upload file');
    }
  }, [isHost, socket, buildFileMeta, broadcastCanvasSnapshot, publishFile]);

  const handleAddNote = useCallback(() => {
    if (!isHost || !socket) return;

    const noteText = window.prompt('Write your note text');
    if (!noteText || !noteText.trim()) return;

    const blob = new Blob([noteText], { type: 'text/plain' });
    const reader = new FileReader();

    reader.onload = () => {
      const payload = {
        ...buildFileMeta(
          new File([blob], `note-${Date.now()}.txt`, { type: 'text/plain' }),
          reader.result,
          'note'
        ),
        notePreview: noteText.slice(0, 140)
      };
      publishFile(payload);
    };

    reader.readAsDataURL(blob);
  }, [isHost, socket, buildFileMeta, publishFile]);

  const ensureMediaWith = useCallback(async ({ needAudio, needVideo }) => {
    const constraints = {
      audio: needAudio,
      video: needVideo
    };

    if (!constraints.audio && !constraints.video) return null;

    return navigator.mediaDevices.getUserMedia(constraints);
  }, []);

  const handleToggleMic = useCallback(async () => {
    try {
      if (isMicEnabled) {
        if (mediaStream) {
          mediaStream.getAudioTracks().forEach((track) => track.stop());
          const remainingVideo = mediaStream.getVideoTracks();
          if (remainingVideo.length === 0) {
            setMediaStream(null);
          }
        }
        setIsMicEnabled(false);
        return;
      }

      const nextStream = await ensureMediaWith({ needAudio: true, needVideo: isVideoEnabled });
      if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(nextStream);
      setIsMicEnabled(nextStream.getAudioTracks().length > 0);
      setIsVideoEnabled(nextStream.getVideoTracks().length > 0);
    } catch (mediaError) {
      console.error('Microphone access error:', mediaError);
      alert('Microphone permission denied or unavailable.');
    }
  }, [isMicEnabled, isVideoEnabled, ensureMediaWith, mediaStream]);

  const handleToggleVideo = useCallback(async () => {
    try {
      if (isVideoEnabled) {
        if (mediaStream) {
          mediaStream.getVideoTracks().forEach((track) => track.stop());
          const remainingAudio = mediaStream.getAudioTracks();
          if (remainingAudio.length === 0) {
            setMediaStream(null);
          }
        }
        setIsVideoEnabled(false);
        return;
      }

      const nextStream = await ensureMediaWith({ needAudio: isMicEnabled, needVideo: true });
      if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(nextStream);
      setIsMicEnabled(nextStream.getAudioTracks().length > 0);
      setIsVideoEnabled(nextStream.getVideoTracks().length > 0);
    } catch (mediaError) {
      console.error('Camera access error:', mediaError);
      alert('Camera permission denied or unavailable.');
    }
  }, [isVideoEnabled, isMicEnabled, ensureMediaWith, mediaStream]);

  const handleToggleScreenShare = useCallback(async () => {
    if (!socket) return;

    if (isScreenSharing) {
      cleanupScreenShare(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      screenShareStreamRef.current = stream;
      setIsScreenSharing(true);
      socket.emit('start-screen-share', { roomId });

      const screenTrack = stream.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.onended = () => cleanupScreenShare(true);
      }

      if (screenShareVideoRef.current) {
        screenShareVideoRef.current.srcObject = stream;
      }

      const captureFrames = () => {
        const videoEl = screenShareVideoRef.current;
        const canvasEl = captureCanvasRef.current;
        if (!videoEl || !canvasEl || videoEl.readyState < 2) return;

        const width = 960;
        const height = Math.max(540, Math.floor((videoEl.videoHeight / (videoEl.videoWidth || 1)) * width));
        canvasEl.width = width;
        canvasEl.height = height;

        const ctx = canvasEl.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoEl, 0, 0, width, height);
        const frame = canvasEl.toDataURL('image/jpeg', 0.6);
        socket.emit('screen-share-frame', { roomId, frame });

        setScreenShares((prev) => ({
          ...prev,
          [user._id]: {
            name: user.name,
            frame
          }
        }));
      };

      frameIntervalRef.current = window.setInterval(captureFrames, 1200);
      window.setTimeout(captureFrames, 500);
    } catch (shareError) {
      console.error('Screen share error:', shareError);
      alert('Screen sharing permission denied or not supported in this browser.');
    }
  }, [socket, isScreenSharing, roomId, cleanupScreenShare, user?._id, user?.name]);

  const handleSendReaction = useCallback((emoji) => {
    if (!emoji || !socket) return;
    socket.emit('send-reaction', { roomId, emoji });
  }, [socket, roomId]);

  const getCanvasElement = () => document.querySelector('canvas');

  const handleDownload = useCallback(() => {
    const canvas = getCanvasElement();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const handleSave = useCallback(() => {
    handleDownload();
  }, [handleDownload]);

  const handlePrint = useCallback(() => {
    const canvas = getCanvasElement();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Whiteboard</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();window.close()" />
        </body>
      </html>
    `);
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
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        <Toolbar
          onToolChange={handleToolChange}
          onColorChange={handleColorChange}
          onBrushSizeChange={handleBrushSizeChange}
          onFillChange={handleFillChange}
          onFillColorChange={handleFillColorChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          onSave={handleSave}
          onDownload={handleDownload}
          onUpload={handleUpload}
          onAddNote={handleAddNote}
          onPrint={handlePrint}
          onToggleChat={handleToggleChat}
          onToggleParticipants={handleToggleParticipants}
          isHost={isHost}
          isMicEnabled={isMicEnabled}
          isVideoEnabled={isVideoEnabled}
          onToggleMic={handleToggleMic}
          onToggleVideo={handleToggleVideo}
          isScreenSharing={isScreenSharing}
          onToggleScreenShare={handleToggleScreenShare}
          onSendReaction={handleSendReaction}
        />

        <div className="flex-1 relative">
          <Canvas
            roomId={roomId}
            socket={socket}
            isHost={isHost}
          />

          {isVideoEnabled && (
            <div className="absolute bottom-3 right-3 w-48 h-32 bg-black rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
                You ({isMicEnabled ? 'Mic on' : 'Mic off'})
              </div>
            </div>
          )}

          <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-none">
            {reactionFeed.map((reaction) => (
              <div
                key={reaction.id}
                className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-gray-800/95 shadow text-sm text-gray-800 dark:text-gray-100"
              >
                <span className="mr-1">{reaction.emoji}</span>
                <span>{reaction.name}</span>
              </div>
            ))}
          </div>
        </div>

        {(Object.keys(screenShares).length > 0 || sharedFiles.length > 0) && (
          <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-3 space-y-4">
            {Object.keys(screenShares).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Live Screen Shares</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {Object.entries(screenShares).map(([shareUserId, share]) => (
                    <div key={shareUserId} className="rounded-lg border dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-900">
                      {share.frame ? (
                        <img src={share.frame} alt={`${share.name} screen`} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                          Waiting for screen frame...
                        </div>
                      )}
                      <div className="px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300">
                        {share.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sharedFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Shared Whiteboard Files</h3>
                <div className="flex flex-wrap gap-2">
                  {sharedFiles.map((file) => (
                    <a
                      key={file.id}
                      href={file.dataUrl}
                      download={file.name}
                      className="px-3 py-1.5 rounded-md text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 hover:opacity-90 max-w-[220px]"
                      title={file.notePreview || file.name}
                    >
                      {file.kind === 'note' ? `Note: ${file.name}` : file.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <MeetingControls
          roomId={roomId}
          isHost={isHost}
          isLocked={isLocked}
          participantCount={participants.length}
          onLockToggle={handleLockToggle}
          onLeave={handleLeaveRoom}
          isMicEnabled={isMicEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
        />
      </div>

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

      <video ref={screenShareVideoRef} autoPlay muted playsInline className="hidden" />
      <canvas ref={captureCanvasRef} className="hidden" />
    </div>
  );
};

export default Whiteboard;
