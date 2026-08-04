import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { getSocket, disconnectSocket } from '../sockets/socketClient';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [socket, setSocket]       = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) { disconnectSocket(); setSocket(null); setConnected(false); return; }
    const s = getSocket(token);
    setSocket(s);
    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on('connect',    onConnect);
    s.on('disconnect', onDisconnect);
    return () => { s.off('connect', onConnect); s.off('disconnect', onDisconnect); };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
