import {useCallback, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ChatMessageType, SocketEvents} from '../../../models/chat.model';
import {AppDispatch, RootState} from '../../../redux/store';
import {addItemMessage} from '../../../redux/slice/chat.slice';
import {useFocusEffect} from '@react-navigation/native';
import {
  getMessageWith,
  markReadMessage,
} from '../../../redux/action/chat.action';
import {unstable_batchedUpdates} from 'react-native';

export function useChatMessages(uid: string, socket: any) {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.user);
  const {isLoadChat} = useSelector((state: RootState) => state.chat);
  const {chat} = useSelector((state: RootState) => state.chat);
  const messageMap = useMemo(() => {
    return chat[uid] || {};
  }, [chat, uid]);

  // Convert object => mảng và sort theo update_time (tăng dần)
  const messages = useMemo(() => {
    return Object.values(messageMap).sort(
      (a, b) => parseInt(b.create_time, 10) - parseInt(a.create_time, 10),
    );
  }, [messageMap]);

  const lastReadMessageId =
    messages.length > 0 ? messages[messages.length - 1].id : undefined;

  useFocusEffect(
    useCallback(() => {
      dispatch(
        getMessageWith({
          conversation_uid: uid,
          token: user?.idToken || '',
        }),
      );
    }, [dispatch, uid, user?.idToken]),
  );

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.emit(SocketEvents.GET_MESSAGE, {with_user: uid});

    const handleIncomingMessage = (data: ChatMessageType[]) => {
      unstable_batchedUpdates(() => {
        dispatch(addItemMessage({uid, message: data}));
        dispatch(
          markReadMessage({
            conversation_uid: uid,
            idToken: user?.idToken || '',
          }),
        );
      });
    };

    socket.on(SocketEvents.NEW_MESSAGE, handleIncomingMessage);

    return () => {
      socket.off(SocketEvents.NEW_MESSAGE, handleIncomingMessage);
      socket.disconnect();
      socket.connect();
    };
  }, [socket, uid, dispatch, user?.idToken]);

  return {messages, lastReadMessageId, isLoadChat};
}
