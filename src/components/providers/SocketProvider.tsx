'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io as ClientIO, Socket } from 'socket.io-client';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

let globalSocketInstance: Socket | null = null;
let isConnecting = false;

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(() => globalSocketInstance);
  const [isConnected, setIsConnected] = useState<boolean>(() => !!globalSocketInstance?.connected);
  const mountedRef = useRef(true);

  const initSocket = useCallback(async () => {
    if (globalSocketInstance?.connected) {
      if (mountedRef.current) {
        setSocket(globalSocketInstance);
        setIsConnected(true);
      }
      return;
    }

    if (isConnecting) return;
    isConnecting = true;

    try {
      const tokenRes = await fetch('/api/socket/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!tokenRes.ok) {
        console.warn('[Socket.IO Client] Socket token route returned status:', tokenRes.status);
        isConnecting = false;
        return;
      }

      const tokenData = await tokenRes.json();
      if (!tokenData?.token) {
        console.warn('[Socket.IO Client] No token in response:', tokenData);
        isConnecting = false;
        return;
      }

      if (globalSocketInstance) {
        globalSocketInstance.removeAllListeners();
        globalSocketInstance.disconnect();
        globalSocketInstance = null;
      }

      const socketUrl =
        tokenData.socketUrl ||
        (typeof window !== 'undefined'
          ? `${window.location.protocol}//${window.location.hostname}:4000`
          : 'http://localhost:4000');

      console.log('[Socket.IO Client] Connecting to socket platform at:', socketUrl);

      const socketInstance = (
        ClientIO as unknown as (url: string, opts?: Record<string, unknown>) => Socket
      )(socketUrl, {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: {
          token: tokenData.token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      globalSocketInstance = socketInstance;

      const joinStandardRooms = () => {
        if (tokenData.role === 'ADMIN') {
          socketInstance.emit('room:join', 'admin:events');
        } else if (tokenData.userId) {
          socketInstance.emit('room:join', `user:${tokenData.userId}`);
        }
      };

      if (mountedRef.current) {
        setSocket(socketInstance);
      }

      socketInstance.on('connect', () => {
        console.log('[Socket.IO Client] Connected successfully:', socketInstance.id);
        if (mountedRef.current) setIsConnected(true);
        joinStandardRooms();
      });

      socketInstance.io.on('reconnect', () => {
        console.log('[Socket.IO Client] Reconnected successfully with ID:', socketInstance.id);
        if (mountedRef.current) setIsConnected(true);
        joinStandardRooms();
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('[Socket.IO Client] Disconnected:', reason);
        if (mountedRef.current) setIsConnected(false);
      });

      socketInstance.on('connect_error', async (error: Error) => {
        console.error('[Socket.IO Client] Connection error:', error.message);

        if (error.message.includes('INVALID_AUTH_TOKEN') || error.message.includes('expired')) {
          try {
            const refreshRes = await fetch('/api/socket/token', {
              method: 'POST',
              cache: 'no-store',
            });
            if (refreshRes.ok) {
              const refreshed = await refreshRes.json();
              if (refreshed.token && socketInstance.auth) {
                (socketInstance.auth as Record<string, unknown>).token = refreshed.token;
              }
            }
          } catch {}
        }
      });
    } catch (error) {
      console.error('[Socket.IO Client] Failed to initialize socket:', error);
    } finally {
      isConnecting = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    initSocket();

    return () => {
      mountedRef.current = false;
    };
  }, [initSocket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
};
