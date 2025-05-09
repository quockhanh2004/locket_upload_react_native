import {useEffect, useRef, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {SocketEvents} from '../../../models/chat.model';
import {MY_SERVER_URL} from '../../../util/constrain';

interface UseSocketEventProps {
  event: string;
  eventListen: string;
  token: string;
}

export const useSocketEvent = ({
  event,
  token,
  eventListen,
}: UseSocketEventProps) => {
  const [data, setData] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(MY_SERVER_URL, {
      transports: ['websocket'],
      secure: true,
      auth: {
        access_token: token,
      },
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on(SocketEvents.CONNECT, () => {
      setConnected(true);
      console.log('✅ Socket connected');
    });

    socket.on(SocketEvents.DISCONNECT, () => {
      setConnected(false);
      console.log('❌ Socket disconnected');
    });

    socket.on(SocketEvents.ERROR, err => {
      console.log('❗ Server error:', err);
    });

    // Lắng nghe sự kiện cụ thể được yêu cầu
    socket.on(eventListen, incomingData => {
      // console.log(`📥 Event [${eventListen}] received:`, incomingData);
      setData(incomingData);
    });

    return () => {
      socket.off(eventListen);
      socket.disconnect();
    };
  }, [event, eventListen, token]);

  return {data, connected, socket: socketRef.current};
};
