/* eslint-disable curly */
import {useEffect} from 'react';
import {Platform, PermissionsAndroid, Linking} from 'react-native';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {navigationTo} from '../screen/HomeScreen';
import {nav} from '../navigation/navName';
import {
  getMessaging,
  getToken,
  onNotificationOpenedApp,
  subscribeToTopic,
} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';

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
const displayNotification = async message => {
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
      title:
        message?.notification?.title || message?.data?.title || 'Thông báo mới',
      body:
        message?.notification?.body ||
        message?.data?.body ||
        'Bạn có tin nhắn mới',
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
export const handleNotificationClick = async data => {
  let lastData;

  if (data) {
    console.log('📌 Nhấn thông báo khi có `data` trực tiếp từ sự kiện.');
    lastData = data;
  } else {
    console.log('📌 Nhấn thông báo khi lấy từ AsyncStorage.');
    const localData = await AsyncStorage.getItem('lastNotificationData');

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
  await handleNotificationClick();
});

async function subscribeTopic() {
  await subscribeToTopic(messaging, 'new_update');
  console.log('Thiết bị đã đăng ký vào topic all_users');
}
/**
 * 7️⃣ Hook khởi tạo Notification Service trong `App.tsx`
 */
export const NotificationService = () => {
  useEffect(() => {
    requestNotificationPermission();
    createNotificationChannel();
    listenToNotificationClicks();

    getFcmToken();

    subscribeTopic();

    const unsubscribe = messaging.onMessage(async remoteMessage => {
      await displayNotification(remoteMessage);
    });

    return unsubscribe;
  }, []);

  onNotificationOpenedApp(messaging, async remoteMessage => {
    console.log('🔘 App chưa kill:', remoteMessage);
    await handleNotificationClick(remoteMessage.data);
  });

  return null;
};

/**
 * 8️⃣ Get Notification token
 */

export const getFcmToken = async () => {
  const fcmToken = await getToken(messaging);
  console.log('FcmToken: ' + fcmToken);
  return fcmToken;
};
