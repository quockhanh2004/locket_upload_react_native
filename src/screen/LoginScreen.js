/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  Button,
  Colors,
  Typography,
  LoaderScreen,
} from 'react-native-ui-lib';
import React, {useEffect, useState} from 'react';
import InputView from '../component/InputView';
import {useNavigation} from '@react-navigation/native';
import {nav} from '../navigation/navName';
import {useDispatch, useSelector} from 'react-redux';
import {login} from '../redux/action/user.action';

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {isLoading} = useSelector(state => state.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    dispatch(login({email, password}));
  };

  const handleResetPassword = () => {
    navigation.navigate(nav.resetPassword);
  };

  useEffect(() => {});
  return (
    <View flex centerV bg-black paddingH-20>
      <Text text20BL marginB-20 white center>
        Login
      </Text>
      <View gap-40>
        <View gap-8>
          <View gap-8>
            <Text white text80BL>
              Email
            </Text>
            <InputView
              width={'100%'}
              value={email}
              onChangeText={setEmail}
              showClear={email.length > 0}
              bgColor={Colors.black}
              borderColor={Colors.grey40}
              borderWidth={1}
              inputStyle={{color: Colors.grey40, ...Typography.text70BL}}
              style={{paddingLeft: 10}}
            />
          </View>
          <View gap-8>
            <Text white text80BL>
              Password
            </Text>
            <InputView
              value={password}
              onChangeText={setPassword}
              eyePassword={true}
              showClear={password.length > 0}
              bgColor={Colors.black}
              borderColor={Colors.grey40}
              borderWidth={1}
              inputStyle={{color: Colors.grey40, ...Typography.text70BL}}
              style={{paddingLeft: 10}}
            />
          </View>
        </View>

        <View gap-10>
          <Button
            label={!isLoading ? 'Login' : ''}
            backgroundColor={Colors.primary}
            black
            onPress={handleLogin}
            borderRadius={8}
            disabled={isLoading}
            text70BL>
            {isLoading && (
              <View row center>
                <Text />
                <LoaderScreen color={Colors.white} size={'small'} />
              </View>
            )}
          </Button>
          <Button
            label="Reset Password"
            backgroundColor={Colors.grey20}
            white
            onPress={handleResetPassword}
            borderRadius={8}
            text70BL
          />
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
