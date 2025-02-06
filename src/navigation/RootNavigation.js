import React, {useEffect} from 'react';

import {nav} from './navName';
import ResetPasswordScreen from '../screen/ResetPasswordScreen';
import LoginScreen from '../screen/LoginScreen';
import HomeScreen from '../screen/HomeScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import AccountScreen from '../screen/AccountScreen';
import CropImageScreen from '../screen/CropImageScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={nav.login}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name={nav.login} component={LoginScreen} />
      <Stack.Screen name={nav.resetPassword} component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

const HomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={nav.home} component={HomeScreen} />
      <Stack.Screen name={nav.accountInfo} component={AccountScreen} />
      <Stack.Screen name={nav.crop} component={CropImageScreen} />
    </Stack.Navigator>
  );
};

const RootNavigation = () => {
  const isLoggedIn = useSelector(state => state.user?.user?.localId);

  return (
    <NavigationContainer>
      {isLoggedIn ? <HomeNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigation;
