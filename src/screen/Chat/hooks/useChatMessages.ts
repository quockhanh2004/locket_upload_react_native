import {useEffect, useState, useCallback} from 'react';
import {ChatMessageType, SocketEvents} from '../../../models/chat.model';
import {
  loadChatFromStorage,
  saveChatToStorage,
} from '../../../helper/chat.storage';

export function useChatMessages(uid: string, socket: any) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [lastReadMessageId, setLastReadMessageId] = useState<
    string | undefined
  >(undefined);

  const loadOldMessages = useCallback(async () => {
    const stored = await loadChatFromStorage(uid);
    const sorted = [...stored].sort(
      (a, b) => parseInt(a.create_time, 10) - parseInt(b.create_time, 10),
    );
    setMessages(sorted);

    if (sorted.length > 0) {
      setLastReadMessageId(sorted[sorted.length - 1].id);
    }
  }, [uid]);

  const handleIncomingMessage = useCallback(
    (data: ChatMessageType) => {
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === data.id);
        const updated = exists
          ? prev.map(msg => (msg.id === data.id ? data : msg))
          : [...prev, data];

        const sorted = [...updated].sort(
          (a, b) => parseInt(a.create_time, 10) - parseInt(b.create_time, 10),
        );
        saveChatToStorage(uid, sorted);
        return sorted;
      });
    },
    [uid],
  );

  useEffect(() => {
    loadOldMessages();
  }, [loadOldMessages]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.emit(SocketEvents.GET_MESSAGE, {
      with_user: uid,
    });
    socket.on(SocketEvents.NEW_MESSAGE, handleIncomingMessage);
    return () => {
      socket.off(SocketEvents.NEW_MESSAGE, handleIncomingMessage);
    };
  }, [socket, handleIncomingMessage, uid]);

  return {messages, lastReadMessageId};
}
