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
import {AppState, Linking} from 'react-native';
import {getAccessToken} from '../redux/action/spotify.action';
import queryString from 'query-string';
import {REDIRECT_URI} from '../util/constrain';
import {getSocket} from './Chat';
import {ListChatType, SocketEvents} from '../models/chat.model';
import {updateListChat} from '../redux/slice/chat.slice';

export const OnOpenAppService = () => {
  const messaging = getMessaging(getApp());
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.user);
  const {isLoadFriends} = useSelector((state: RootState) => state.friends);
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

  useEffect(() => {
    const socket = getSocket(user?.idToken);
    if (socket) {
      socket.on(SocketEvents.ERROR, error => {
        console.error('Socket error:', error);
      });

      socket.on(SocketEvents.LIST_MESSAGE, (data: ListChatType[]) => {
        dispatch(updateListChat(data));
      });
    }
  }, [user?.idToken]);

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

  useFocusEffect(
    useCallback(() => {
      if (user?.localId) {
        const now = new Date().getTime() + 15 * 60 * 1000;
        const expires = user.timeExpires ? +user.timeExpires : 0;

        if (expires >= now && user?.idToken && !isLoadFriends) {
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
