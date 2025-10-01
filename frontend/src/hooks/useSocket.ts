import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import type { IMessage } from "../components/DriverPanel";

export const useSocket = ({ onMessageCallback }: {  onMessageCallback: (data: IMessage) => void}) => {

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        setSocket(io("http://localhost:3001"));
    }, []);

    useEffect(() => {
        if(!socket) return;

        socket.on("message", (data: IMessage) => {
            onMessageCallback(data);
        });

        return () => {
            socket.off("message");
        };
  }, []);

}