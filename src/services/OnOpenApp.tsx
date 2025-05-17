/* eslint-disable react-hooks/exhaustive-deps */
import {
  getInitialNotification,
  getMessaging,
} from '@react-native-firebase/messaging';
import {useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {handleNotificationClick} from './Notification';
import {getAccountInfo, getToken} from '../redux/action/user.action';
import {AppDispatch, RootState} from '../redux/store';
import {getFriends} from '../redux/action/getFriend.action';
import {getApp} from '@react-native-firebase/app';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {cleanOldPostAsync} from '../redux/action/getOldPost.action';
import {AppState, Linking, unstable_batchedUpdates} from 'react-native';
import {getAccessToken} from '../redux/action/spotify.action';
import queryString from 'query-string';
import {REDIRECT_URI} from '../util/constrain';
import {getSocket} from './Chat';
import {ListChatType, SocketEvents} from '../models/chat.model';
import {getMessage} from '../redux/action/chat.action';
import {setNotification, updateListChat} from '../redux/slice/chat.slice';

export const OnOpenAppService = () => {
  const messaging = getMessaging(getApp());
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.user);
  const {isLoadFriends, friends} = useSelector(
    (state: RootState) => state.friends,
  );
  const socket = getSocket(user?.idToken);

  // dọn dẹp các bài viết cũ
  // lấy data deeplink
  useEffect(() => {
    if (user?.localId) {
      dispatch(cleanOldPostAsync(user.localId));
    }
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          handleOpenURL(url);
        }
      })
      .catch(err => console.error('Error getting initial URL:', err));
    const subscription = Linking.addEventListener('url', handleOpenURL);
    return () => {
      subscription.remove();
    };
  }, []);

  //kết nối socket
  useEffect(() => {
    console.log('socket start');

    if (socket) {
      socket.on(SocketEvents.ERROR, error => {
        console.error('Socket error:', error);
      });
    }
  }, [user?.idToken]);

  //lắng nghe tin nhắn mới
  useEffect(() => {
    if (!socket) {
      return;
    }

    let timeInterval: NodeJS.Timeout | null = null;
    let uid: string = '';
    const handleIncomingMessage = (data: ListChatType[]) => {
      if (data.length === 1) {
        const message = data[0];
        const with_user = friends[message.with_user];
        const is_read = message.is_read;
        const latest_message = message.latest_message;
        uid = message.uid;

        //nếu trong 100ms mà is_read cùng uid chưa thay đổi thành true thì gửi noti
        if (!is_read) {
          timeInterval = setTimeout(() => {
            dispatch(
              setNotification({
                uid: uid,
                body: latest_message,
                title: `${with_user?.first_name}`,
              }),
            );
          }, 100);
        } else {
          if (timeInterval) {
            clearTimeout(timeInterval);
          }
        }
      }

      dispatch(updateListChat(data));
    };

    socket.on(SocketEvents.LIST_MESSAGE, handleIncomingMessage);

    return () => {
      socket.off(SocketEvents.LIST_MESSAGE, handleIncomingMessage);
    };
  }, [socket, dispatch, friends]);

  // Sự kiện deeplink
  const handleOpenURL = (event: any) => {
    const url = event.url || event;

    if (url && url.startsWith(REDIRECT_URI)) {
      const parsed = queryString.parseUrl(url);
      const code = parsed.query.code as string;
      if (code) {
        dispatch(getAccessToken({code}));
      }
    }
  };

  // Lắng nghe sự kiện khi app quay về foreground
  // Thông báo, refresh token và lấy thông tin tài khoản
  const isFocused = useIsFocused();
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/background|inactive/) &&
        nextAppState === 'active'
      ) {
        if (isFocused) {
          const fetchData = async () => {
            const remoteMessage = await getInitialNotification(messaging);
            if (remoteMessage?.data) {
              const notiData = {
                ...remoteMessage.data,
                timestamp: remoteMessage.sentTime,
              };
              handleNotificationClick(notiData); // isFocused đã được kiểm tra ở ngoài
            }

            if (user) {
              const now = new Date().getTime() + 15 * 60 * 1000;
              const expires = Number(user.timeExpires) || 0;
              if (expires < now && user.refreshToken) {
                dispatch(getToken({refreshToken: user.refreshToken}));
              } else if (expires >= now && user.idToken) {
                dispatch(
                  getAccountInfo({
                    idToken: user.idToken,
                    refreshToken: user.refreshToken || '',
                  }),
                );
              }
            }
          };

          fetchData();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch, isFocused, user]);

  // lấy danh sách bạn bè, thông tin tài khoản khi app mở lần đầu
  useFocusEffect(
    useCallback(() => {
      if (user?.localId) {
        const now = new Date().getTime() + 15 * 60 * 1000;
        const expires = user.timeExpires ? +user.timeExpires : 0;

        if (expires >= now && user?.idToken && !isLoadFriends) {
          unstable_batchedUpdates(() => {
            dispatch(
              getFriends({
                idToken: user?.idToken || '',
              }),
            );
            dispatch(
              getAccountInfo({
                idToken: user.idToken,
                refreshToken: user.refreshToken || '',
              }),
            );
            dispatch(getMessage(user.idToken));
          });
        } else {
          dispatch(getToken({refreshToken: user.refreshToken}));
        }

        //settimeout refresh token trước khi token hết hạn
        // bằng cách trừ thời gian hết hạn và thời gian hiện tại
        const timeLeft = expires - now;
        const refreshTime = timeLeft - 5 * 60 * 1000; // 5 phút trước khi hết hạn
        //nếu tim left < 5 phút thì không cần set timeout
        if (refreshTime < 0) {
          dispatch(getToken({refreshToken: user.refreshToken}));
          return;
        }
        const timeoutId = setTimeout(() => {
          dispatch(getToken({refreshToken: user.refreshToken}));
        }, refreshTime);
        return () => {
          clearTimeout(timeoutId);
        };
      }
    }, [user, dispatch]),
  );

  return null;
};
