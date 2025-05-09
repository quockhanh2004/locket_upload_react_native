import {useEffect, useRef, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {SocketEvents} from '../../../models/chat.model';
import {MY_SERVER_URL} from '../../../util/constrain';

interface UseSocketEventProps {
  event: string;
  eventListen: string;
  token: string;
  initData?: any;
  debounceTime?: number; // Thời gian debounce, mặc định 300ms
}

export const useSocketEvent = ({
  event,
  token,
  eventListen,
  initData,
  debounceTime = 300,
}: UseSocketEventProps) => {
  const [data, setData] = useState<any[]>(initData || []);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Dùng để giữ timeout ID

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
      // Nếu có timeout trước đó, hủy nó để không cập nhật quá sớm
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Đặt lại timeout để chỉ cập nhật dữ liệu khi đã hết thời gian debounce
      debounceTimeoutRef.current = setTimeout(() => {
        setData(prevData => {
          const existingIndex = prevData.findIndex(
            item => item.uid === incomingData.uid,
          );

          if (existingIndex !== -1) {
            const updatedData = [...prevData];
            updatedData[existingIndex] = incomingData;
            return updatedData;
          } else {
            return prevData.concat(incomingData);
          }
        });
      }, debounceTime);
    });

    return () => {
      socket.off(eventListen);
      socket.disconnect();
      // Dọn dẹp timeout khi component unmount
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [event, eventListen, token, debounceTime]);

  return {data, connected, socket: socketRef.current};
};
