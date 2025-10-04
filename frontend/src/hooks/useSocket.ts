import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketOptions {
  url?: string;
  autoConnect?: boolean;
}

// export function useSocket({ url = "https://logistics-assignment.onrender.com", autoConnect = true }: SocketOptions = {}) {
export function useSocket({ url = "http://localhost:3001", autoConnect = true }: SocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(url, { autoConnect });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, autoConnect]);

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socketRef.current?.off(event, callback);
  };

  return {
    socket: socketRef.current,
    connected,
    emit,
    on,
    off,
  };
}
