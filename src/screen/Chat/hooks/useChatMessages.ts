import {useEffect, useState, useCallback, useRef} from 'react';
import {ChatMessageType, SocketEvents} from '../../../models/chat.model';
import {
  loadChatFromStorage,
  saveChatToStorage,
} from '../../../helper/chat.storage';

export function useChatMessages(uid: string, socket: any) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [lastReadMessageId, setLastReadMessageId] = useState<string>();
  const isMounted = useRef(true);

  // Chỉ setState nếu component còn mount
  const safeSetMessages = useCallback((newMessages: ChatMessageType[]) => {
    if (isMounted.current) {
      setMessages(newMessages);
    }
  }, []);

  const sortMessages = useCallback((msgs: ChatMessageType[]) => {
    return [...msgs].sort(
      (a, b) => parseInt(a.create_time, 10) - parseInt(b.create_time, 10),
    );
  }, []);

  const loadOldMessages = useCallback(async () => {
    try {
      const stored = await loadChatFromStorage(uid);
      const sorted = sortMessages(stored);
      safeSetMessages(sorted);
      if (sorted.length > 0) {
        setLastReadMessageId(sorted[sorted.length - 1].id);
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  }, [uid, sortMessages, safeSetMessages]);

  const handleIncomingMessage = useCallback(
    (data: ChatMessageType) => {
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === data.id);
        const updated = exists
          ? prev.map(msg => (msg.id === data.id ? data : msg))
          : [...prev, data];
        const sorted = sortMessages(updated);

        // Lưu trữ bất đồng bộ để không block UI
        saveChatToStorage(uid, sorted);
        return sorted;
      });
    },
    [uid, sortMessages],
  );

  useEffect(() => {
    isMounted.current = true;
    loadOldMessages();
    return () => {
      isMounted.current = false;
    };
  }, [loadOldMessages]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.emit(SocketEvents.GET_MESSAGE, {with_user: uid});
    socket.on(SocketEvents.NEW_MESSAGE, handleIncomingMessage);

    return () => {
      socket.off(SocketEvents.NEW_MESSAGE, handleIncomingMessage);
    };
  }, [socket, handleIncomingMessage, uid]);

  return {messages, lastReadMessageId};
}
