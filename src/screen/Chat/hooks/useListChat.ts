import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';

export function useListChat() {
  const isLoadChat = useSelector((state: RootState) => state.chat.isLoadChat);
  const messageMap = useSelector(
    (state: RootState) => state.chat.listChat || {},
  );

  // Convert object => mảng và sort theo update_time (tăng dần)
  const listMessages = useMemo(() => {
    return Object.values(messageMap).sort(
      (a, b) => parseInt(b.update_time, 10) - parseInt(a.update_time, 10),
    );
  }, [messageMap]);

  return {listMessages, isLoadChat};
}
