import {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../redux/store';
import {getSocket} from '../../../services/Chat';
import {ListChatType, SocketEvents} from '../../../models/chat.model';
import {setNotification, updateListChat} from '../../../redux/slice/chat.slice';

export function useListChat() {
  const dispatch = useDispatch<AppDispatch>();
  const isLoadChat = useSelector((state: RootState) => state.chat.isLoadChat);
  const messageMap = useSelector(
    (state: RootState) => state.chat.listChat || {},
  );
  const {user} = useSelector((state: RootState) => state.user);
  const socket = getSocket(user?.idToken);

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

    let timeInterval: NodeJS.Timeout;
    let uid = null;
    const handleIncomingMessage = (data: ListChatType[]) => {
      if (data.length === 1) {
        const message = data[0];
        const with_user = message.with_user;
        const is_read = message.is_read;
        const latest_message = message.latest_message;
        uid = message.uid;

        //nếu trong 100ms mà is_read cùng uid chưa thay đổi thành true thì gửi noti
        if (!is_read) {
          timeInterval = setTimeout(() => {
            dispatch(setNotification({
              
            }))
          }, 100);
        }
      }

      dispatch(updateListChat(data));
    };

    socket.on(SocketEvents.LIST_MESSAGE, handleIncomingMessage);

    return () => {
      socket.off(SocketEvents.LIST_MESSAGE, handleIncomingMessage);
    };
  }, [socket, dispatch]);

  return {listMessages, isLoadChat};
}
