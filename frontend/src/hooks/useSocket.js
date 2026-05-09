import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../App';

export function useSocket() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (isAuthenticated && !socket.connected) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        socket.auth = { token };
        socket.connect();
      }
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [isAuthenticated]);

  return { socket, isConnected };
}
