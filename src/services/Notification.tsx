/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable curly */
import {useEffect} from 'react';
import {Platform, PermissionsAndroid, Linking} from 'react-native';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {nav} from '../navigation/navName';
import {
  FirebaseMessagingTypes,
  getMessaging,
  getToken,
  onNotificationOpenedApp,
  subscribeToTopic,
  unsubscribeFromTopic,
} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';
import {version} from '../../package.json';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../redux/store';
import {setCurrentVersion} from '../redux/slice/setting.slice';
import {navigationTo} from '../navigation/HomeNavigation';

const CHANNEL_ID = 'locket_upload_channel';
const messaging = getMessaging(getApp());

/**
 * 1️⃣ Yêu cầu quyền thông báo trên Android 13+
 */
const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('⚠️ Người dùng từ chối quyền thông báo');
      return;
    }
  }
  console.log('✅ Quyền thông báo được cấp');
};

/**
 * 2️⃣ Tạo kênh thông báo Notifee (Android)
 */
const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Locket Upload Channel',
    importance: AndroidImportance.HIGH,
  });
};

/**
 * 3️⃣ Hiển thị thông báo bằng Notifee và lưu `data`
 */
const displayNotification = async (
  message: FirebaseMessagingTypes.RemoteMessage,
) => {
  if (!message) return;

  console.log('🔔 Nhận thông báo:', message);

  // Lưu `data` vào AsyncStorage để lấy lại khi người dùng nhấn vào
  if (message.data) {
    await AsyncStorage.setItem(
      'lastNotificationData',
      JSON.stringify(message.data),
    );
  }

  try {
    await notifee.displayNotification({
      title: message?.notification?.title || 'Thông báo mới',
      body: message?.notification?.body || 'Bạn có tin nhắn mới',
      android: {
        smallIcon: 'ic_launcher',
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: {id: 'default'},
      },
    });
  } catch (error) {
    console.log('show noti error', error);
  }
};

/**
 * 4️⃣ Xử lý khi người dùng nhấn vào thông báo (Mở link nếu có)
 */
interface DataNotification {
  update_url?: string;
  local_update?: string;
  navigation_to?: string;
  timestamp?: number;
}

export const handleNotificationClick = async (data?: DataNotification) => {
  let lastData: DataNotification | undefined;
  const localData = await AsyncStorage.getItem('lastNotificationData');

  if (data) {
    console.log('📌 Nhấn thông báo khi có `data` trực tiếp từ sự kiện.');
    if (
      JSON.parse(localData || '{}')?.timestamp === data?.timestamp &&
      data?.timestamp
    ) {
      return;
    }
    lastData = {...data};
    await AsyncStorage.setItem(
      'lastNotificationData',
      JSON.stringify(lastData),
    );
  } else {
    console.log('📌 Nhấn thông báo khi lấy từ AsyncStorage.');
    await AsyncStorage.setItem('lastNotificationData', '{}');
    // Kiểm tra nếu có dữ liệu, mới parse JSON
    if (localData) {
      lastData = JSON.parse(localData);
    }
  }

  if (lastData) {
    console.log('🔗 Dữ liệu từ thông báo:', lastData);

    // Nếu có `update_url`, mở trình duyệt
    if (lastData.update_url) {
      Linking.openURL(lastData.update_url).catch(err =>
        console.error('Lỗi mở URL:', err),
      );
    }

    if (lastData.local_update) {
      navigationTo(nav.accountInfo, {local_update: true});
    }

    if (lastData.navigation_to) {
      navigationTo(lastData.navigation_to);
    }
  }
};

/**
 * 5️⃣ Xử lý sự kiện khi nhận thông báo trong app
 */
const listenToNotificationClicks = () => {
  // Khi app đang mở (Foreground)
  notifee.onForegroundEvent(async ({type, detail}) => {
    if (type === EventType.PRESS) {
      console.log('🔘 Người dùng nhấn vào thông báo khi app mở', detail);
      await handleNotificationClick();
    }
  });
};

/**
 * 6️⃣ Lắng nghe thông báo khi app đang background
 */
notifee.onBackgroundEvent(async event => {
  console.log('Nhấn thông báo khi app ở background:', event.detail);
  await handleNotificationClick(event.detail.notification?.data);
});

async function subscribeTopic(appVersion: string, dispatch: any) {
  await subscribeToTopic(messaging, 'new_update');
  if (appVersion && appVersion !== version) {
    try {
      await unsubscribeFromTopic(messaging, appVersion);
      console.log('Thiết bị đã hủy đăng ký topic ' + appVersion);
    } catch (error) {
      console.error('Lỗi hủy đăng ký topic:', error);
    }
    dispatch(setCurrentVersion(version));
  }
  await subscribeToTopic(messaging, version);
  console.log('Thiết bị đã đăng ký vào topic all_users, ' + version);
}
/**
 * 7️⃣ Hook khởi tạo Notification Service trong `App.tsx`
 */
export const NotificationService = () => {
  const dispatch = useDispatch<AppDispatch>();
  const appVersion = useSelector(
    (state: RootState) => state.setting?.appVersion,
  );

  useEffect(() => {
    requestNotificationPermission();
    createNotificationChannel();
    listenToNotificationClicks();

    getFcmToken();

    subscribeTopic(appVersion, dispatch);

    const unsubscribe = messaging.onMessage(async remoteMessage => {
      await displayNotification(remoteMessage);
    });

    return unsubscribe;
  }, []);

  onNotificationOpenedApp(messaging, async remoteMessage => {
    console.log('🔘 App chưa kill:', remoteMessage);
    const data = {
      ...remoteMessage.data,
      timestamp: remoteMessage.sentTime,
    };
    await handleNotificationClick(data);
  });

  return null;
};

/**
 * 8️⃣ Get Notification token
 */

export const getFcmToken = async (): Promise<string> => {
  const fcmToken = await getToken(messaging);
  console.log('FcmToken: ' + fcmToken);
  return fcmToken;
};
