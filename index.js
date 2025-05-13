/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';
import {LogBox} from 'react-native';

const messaging = getMessaging(getApp());

setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

LogBox.ignoreLogs([
  'ReactImageView: Image source "null" doesn\'t exist',
  'VirtualizedLists should never be nested inside plain ScrollViews',
]);

AppRegistry.registerComponent(appName, () => App);
