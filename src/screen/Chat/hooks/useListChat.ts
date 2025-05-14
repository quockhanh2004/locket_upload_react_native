import {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ListChatType, SocketEvents} from '../../../models/chat.model';
import {AppDispatch, RootState} from '../../../redux/store';
import {updateListChat} from '../../../redux/slice/chat.slice';
import {getSocket} from '../../../services/Chat';

export function useListChat() {
  const {user} = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const isLoadChat = useSelector((state: RootState) => state.chat.isLoadChat);
  const messageMap = useSelector(
    (state: RootState) => state.chat.listChat || {},
  );
  const socket = useMemo(() => {
    return user?.idToken ? getSocket(user.idToken) : null;
  }, [user?.idToken]);

  // Convert object => mảng và sort theo update_time (tăng dần)
  const listMessages = useMemo(() => {
    return Object.values(messageMap).sort(
      (a, b) => parseInt(b.update_time, 10) - parseInt(a.update_time, 10),
    );
  }, [messageMap]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleIncomingMessage = (data: ListChatType[]) => {
      dispatch(updateListChat(data));
    };

    socket.on(SocketEvents.LIST_MESSAGE, handleIncomingMessage);

    return () => {
      socket.off(SocketEvents.LIST_MESSAGE, handleIncomingMessage);
    };
  }, [socket, dispatch]);

  return {listMessages, isLoadChat};
}
