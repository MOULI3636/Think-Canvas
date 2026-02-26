import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const useSocketEvents = (events = {}) => {
  const { socket, on, off } = useSocket();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    setIsConnected(true);

    // Register event listeners
    Object.entries(events).forEach(([event, handler]) => {
      on(event, handler);
    });

    return () => {
      // Cleanup event listeners
      Object.keys(events).forEach(event => {
        off(event);
      });
    };
  }, [socket, events, on, off]);

  return { socket, isConnected };
};

export default useSocketEvents;