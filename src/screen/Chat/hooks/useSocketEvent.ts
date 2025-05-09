import {useEffect, useRef, useState} from 'react';
import {Socket} from 'socket.io-client';
import {getSocket} from '../../../services/Chat';

interface UseSocketEventProps {
  eventListen: string;
  token: string;
  debounceTime?: number; // default: 300ms
}

export const useSocketEvent = ({
  eventListen,
  token,
  debounceTime = 300,
}: UseSocketEventProps) => {
  const [data, setData] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  const bufferRef = useRef<any[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket(token);
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onEvent = (incoming: any) => {
      bufferRef.current = updateBuffer(bufferRef.current, incoming);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setData([...bufferRef.current]);
        bufferRef.current = []; // Clear buffer after emitting
      }, debounceTime);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(eventListen, onEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(eventListen, onEvent);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [eventListen, token, debounceTime]);

  return {data, connected, socket: socketRef.current};
};

// helper: update or insert into array by uid
function updateBuffer(prevArray: any[], incoming: any): any[] {
  const index = prevArray.findIndex(item => item.uid === incoming.uid);
  if (index !== -1) {
    const updated = [...prevArray];
    updated[index] = incoming;
    return updated;
  } else {
    return [...prevArray, incoming];
  }
}
