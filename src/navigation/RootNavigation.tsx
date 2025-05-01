/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

import {AppDispatch, RootState} from '../redux/store';
import {restoreOldData} from '../util/migrateOldPersist';
import {nav} from './navName';
import queryString from 'query-string';

import LoginScreen from '../screen/LoginScreen';
import HomeScreen from '../screen/HomeScreen';
import AccountScreen from '../screen/AccountScreen/AccountScreen';
import CropImageScreen from '../screen/CropImageScreen';
import SettingScreen from '../screen/SettingScreen';
import CameraScreen from '../screen/CameraScreen';
import PostScreen from '../screen/PostScreen';
import {Linking} from 'react-native';
import {getAccessToken} from '../redux/action/spotify.action';
import DonateDialog from '../Dialog/DonateDialog';

const REDIRECT_URI = 'locketupload.spotify://oauth';
const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    restoreOldData(dispatch);
  }, []);
  return (
    <Stack.Navigator
      initialRouteName={nav.login}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name={nav.login} component={LoginScreen} />
    </Stack.Navigator>
  );
};

const HomeNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
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
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={nav.home} component={HomeScreen} />
      <Stack.Screen name={nav.accountInfo} component={AccountScreen} />
      <Stack.Screen name={nav.crop} component={CropImageScreen} />
      <Stack.Screen name={nav.setting} component={SettingScreen} />
      <Stack.Screen name={nav.camera} component={CameraScreen} />
      <Stack.Screen name={nav.posts} component={PostScreen} />
    </Stack.Navigator>
  );
};

const RootNavigation = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user);

  return (
    <>
      <NavigationContainer>
        {isLoggedIn.user ? <HomeNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <DonateDialog />
    </>
  );
};

export default RootNavigation;
