/* eslint-disable curly */
import {useEffect} from 'react';
import {Platform, PermissionsAndroid, Linking} from 'react-native';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import messaging, {getToken} from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {navigationTo} from '../screen/HomeScreen';
import {nav} from '../navigation/navName';

const CHANNEL_ID = 'locket_upload_channel';

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
};

/**
 * 4️⃣ Xử lý khi người dùng nhấn vào thông báo (Mở link nếu có)
 */
const handleNotificationClick = async data => {
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
  }
};

/**
 * 5️⃣ Xử lý sự kiện khi người dùng nhấn vào thông báo
 */
const listenToNotificationClicks = () => {
  // Khi app đang mở (Foreground)
  notifee.onForegroundEvent(async ({type, detail}) => {
    if (type === EventType.PRESS) {
      console.log('🔘 Người dùng nhấn vào thông báo khi app mở');
      await handleNotificationClick();
    }
  });

  // Khi app đang chạy nền (Background)
  messaging().onNotificationOpenedApp(async remoteMessage => {
    console.log(
      '🔘 Người dùng nhấn vào thông báo khi app chạy nền:',
      remoteMessage,
    );
    await handleNotificationClick(remoteMessage.notification.data);
  });

  // Khi app bị tắt hoàn toàn (Killed State)
  messaging()
    .getInitialNotification()
    .then(async remoteMessage => {
      if (remoteMessage) {
        console.log(
          '🔘 Người dùng nhấn vào thông báo khi app bị tắt:',
          remoteMessage,
        );
        await handleNotificationClick(remoteMessage.notification.data);
      }
    });
};

/**
 * 6️⃣ Lắng nghe thông báo khi app đang mở
 */
const listenToForegroundNotifications = () => {
  return messaging().onMessage(async remoteMessage => {
    await displayNotification(remoteMessage);
  });
};

/**
 * 7️⃣ Xử lý thông báo khi app ở Background hoặc Killed State
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🌙 Nhận thông báo nền:', remoteMessage);

  // Nếu có `notification`, FCM đã tự hiển thị => Bỏ qua Notifee
  if (remoteMessage.notification) return;

  await displayNotification(remoteMessage);
});

/**
 * 8️⃣ Hook khởi tạo Notification Service trong `App.tsx`
 */
export const NotificationService = () => {
  useEffect(() => {
    requestNotificationPermission();
    createNotificationChannel();
    listenToNotificationClicks();
    getFcmToken();
    const unsubscribeForeground = listenToForegroundNotifications();

    return () => {
      unsubscribeForeground();
    };
  }, []);

  return null;
};

export const getFcmToken = async () => {
  const fcmToken = await messaging().getToken();
  console.log('FcmToken: ' + fcmToken);
  return fcmToken;
};
