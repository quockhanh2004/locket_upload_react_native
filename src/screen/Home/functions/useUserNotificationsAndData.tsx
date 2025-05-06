/* eslint-disable react-hooks/exhaustive-deps */
import {
  getInitialNotification,
  getMessaging,
} from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {handleNotificationClick} from '../../../services/Notification';
import {getAccountInfo, getToken} from '../../../redux/action/user.action';
import {AppDispatch} from '../../../redux/store';
import {getFriends} from '../../../redux/action/getFriend.action';
import {User} from '../../../models/user.model';
import {getApp} from '@react-native-firebase/app';

const useUserNotificationsAndData = (
  user?: User | null,
  isLoadFriends?: boolean,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const messaging = getMessaging(getApp());

  useEffect(() => {
    const fetchData = async () => {
      // Xử lý thông báo ban đầu
      const remoteMessage = await getInitialNotification(messaging);
      if (remoteMessage?.data) {
        handleNotificationClick(remoteMessage.data);
      }

      // Kiểm tra và xử lý thông tin người dùng
      if (user) {
        const now = new Date().getTime();
        const expires = user.timeExpires ? +user.timeExpires : 0;
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
  }, [user, dispatch]);

  useEffect(() => {
    if (user?.localId) {
      const now = new Date().getTime();
      const expires = user.timeExpires ? +user.timeExpires : 0;

      if (expires >= now && user.idToken && !isLoadFriends) {
        dispatch(
          getFriends({
            idToken: user?.idToken || '',
          }),
        );
      }
    }
  }, [user?.localId, dispatch]);
};

export default useUserNotificationsAndData;
