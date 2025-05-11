import {useEffect, useState, useCallback, useRef} from 'react';
import {ChatMessageType, SocketEvents} from '../../../models/chat.model';
import {
  loadChatFromStorage,
  saveChatToStorage,
} from '../../../helper/chat.storage';
import {InteractionManager} from 'react-native';

let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 500;

export function useChatMessages(uid: string, socket: any) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [lastReadMessageId, setLastReadMessageId] = useState<string>();
  const firstLoaded = useRef(false);
  const bufferedMessages = useRef<ChatMessageType[]>([]);
  const messageMap = useRef<Map<string, ChatMessageType>>(new Map());

  // Dừng debounce khi chuyển đoạn chat
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    // Reset các dữ liệu khi chuyển qua đoạn chat mới
    bufferedMessages.current = [];
    messageMap.current.clear();
    setMessages([]);
    firstLoaded.current = false;
  }, [uid]); // Khi `uid` thay đổi, sẽ reset tất cả

  // Load tin nhắn từ AsyncStorage khi lần đầu mở
  const loadOldMessages = useCallback(async () => {
    const stored = await loadChatFromStorage(uid);
    const sorted = stored.sort(
      (a, b) => parseInt(a.create_time, 10) - parseInt(b.create_time, 10),
    );
    sorted.forEach(msg => messageMap.current.set(msg.id, msg));
    setMessages(sorted);
    if (sorted.length > 0) {
      setLastReadMessageId(sorted[sorted.length - 1].id);
    }
    firstLoaded.current = true;
  }, [uid]);

  // Debounce xử lý mảng tin nhắn
  const flushBufferedMessages = useCallback(() => {
    if (bufferedMessages.current.length === 0) {
      return;
    }

    let hasNew = false;

    bufferedMessages.current.forEach(msg => {
      if (!messageMap.current.has(msg.id)) {
        messageMap.current.set(msg.id, msg);
        hasNew = true;
      }
    });

    if (hasNew) {
      const merged = Array.from(messageMap.current.values()).sort(
        (a, b) => parseInt(a.create_time, 10) - parseInt(b.create_time, 10),
      );
      setMessages(merged); // Cập nhật danh sách tin nhắn
      saveChatToStorage(uid, merged); // Lưu vào storage
    }

    bufferedMessages.current = []; // Reset buffered messages sau khi flush
  }, [uid]);

  // Mỗi lần nhận message thì dồn vào buffer
  const handleIncomingMessage = useCallback(
    (data: ChatMessageType) => {
      bufferedMessages.current.push(data);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          flushBufferedMessages();
        });
      }, DEBOUNCE_DELAY);
    },
    [flushBufferedMessages],
  );

  useEffect(() => {
    loadOldMessages();
  }, [loadOldMessages]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.emit(SocketEvents.GET_MESSAGE, {with_user: uid});
    socket.on(SocketEvents.NEW_MESSAGE, handleIncomingMessage);

    return () => {
      socket.disconnect();
      socket.connect();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [socket, handleIncomingMessage, uid]);

  return {messages, lastReadMessageId};
}
