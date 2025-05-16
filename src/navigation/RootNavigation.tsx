/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';

import {AppDispatch, RootState} from '../redux/store';
import {restoreOldData} from '../utils/migrateOldPersist.ts';
import {nav} from './navName';

import LoginScreen from '../screen/LoginScreen';
import HomeScreen from '../screen/Home';
import AccountScreen from '../screen/Account/AccountScreen';
import CropImageScreen from '../screen/CropImageScreen';
import SettingScreen from '../screen/Settings/SettingScreen';
import CameraScreen from '../screen/Camera/CameraScreen';
import PostScreen from '../screen/Moment';
import MessageDialog from '../components/Dialog/MessageDialog';
import DonateDialog from '../components/Dialog/DonateDialog';
import SelectIconScreen from '../screen/SelectIconScreen';
import AutoCheckUpdate from '../services/AutoCheckUpdate';
import {OnOpenAppService} from '../services/OnOpenApp';

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
  return (
    <>
      <OnOpenAppService />
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={nav.home} component={HomeScreen} />
        <Stack.Screen name={nav.accountInfo} component={AccountScreen} />
        <Stack.Screen name={nav.crop} component={CropImageScreen} />
        <Stack.Screen name={nav.setting} component={SettingScreen} />
        <Stack.Screen name={nav.camera} component={CameraScreen} />
        <Stack.Screen name={nav.posts} component={PostScreen} />
        <Stack.Screen name={nav.selectIcon} component={SelectIconScreen} />
      </Stack.Navigator>
    </>
  );
};

const RootNavigation = () => {
  const isLoggedIn = useSelector((state: RootState) => state.user);

  return (
    <>
      <NavigationContainer>
        {isLoggedIn.user ? <HomeNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <MessageDialog />
      <DonateDialog />
      <AutoCheckUpdate />
    </>
  );
};

export default RootNavigation;
