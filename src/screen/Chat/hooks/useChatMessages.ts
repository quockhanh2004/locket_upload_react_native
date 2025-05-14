import {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ChatMessageType, SocketEvents} from '../../../models/chat.model';
import {AppDispatch, RootState} from '../../../redux/store';
import {addItemMessage} from '../../../redux/slice/chat.slice';

export function useChatMessages(uid: string, socket: any) {
  const dispatch = useDispatch<AppDispatch>();
  const isLoadChat = useSelector((state: RootState) => state.chat.isLoadChat);
  const messageMap = useSelector(
    (state: RootState) => state.chat.chat[uid] || {},
  );

  // Convert object => mảng và sort theo update_time (tăng dần)
  const messages = useMemo(() => {
    return Object.values(messageMap).sort(
      (a, b) => parseInt(b.create_time, 10) - parseInt(a.create_time, 10),
    );
  }, [messageMap]);

  const lastReadMessageId =
    messages.length > 0 ? messages[messages.length - 1].id : undefined;

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.emit(SocketEvents.GET_MESSAGE, {with_user: uid});

    const handleIncomingMessage = (data: ChatMessageType[]) => {
      dispatch(addItemMessage({uid, message: data}));
    };

    socket.on(SocketEvents.NEW_MESSAGE, handleIncomingMessage);

    return () => {
      socket.off(SocketEvents.NEW_MESSAGE, handleIncomingMessage);
    };
  }, [socket, uid, dispatch]);

  return {messages, lastReadMessageId, isLoadChat};
}
