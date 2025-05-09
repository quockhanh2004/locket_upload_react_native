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
import {REDIRECT_URI} from '../util/constraints';

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
              if (isFocused) {
                handleNotificationClick(notiData);
              }
            }

            if (user && isFocused) {
              const now = Date.now();
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
  }, [dispatch, isFocused]);

  useFocusEffect(
    useCallback(() => {
      if (user?.localId) {
        const now = new Date().getTime();
        const expires = user.timeExpires ? +user.timeExpires : 0;

        if (expires >= now && user?.idToken && !isLoadFriends) {
          dispatch(
            getFriends({
              idToken: user?.idToken || '',
            }),
          );
        } else {
          dispatch(getToken({refreshToken: user.refreshToken}));
        }
      }
    }, [user?.localId, dispatch]),
  );

  return null;
};
