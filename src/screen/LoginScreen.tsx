/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  Button,
  Colors,
  Typography,
  LoaderScreen,
} from 'react-native-ui-lib';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../redux/store';
import {TextInput} from 'react-native';

import InputView from '../components/InputView';
import {login, resetPassword} from '../redux/action/user.action';
import {setMessage} from '../redux/slice/message.slice';
import {checkEmail} from '../util/regex';
import {clearStatus} from '../redux/slice/user.slice';

const LoginScreen = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {isLoading, resetPasswordLoading} = useSelector(
    (state: RootState) => state.user,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (checkValue(false)) {
      dispatch(login({email: email.trim(), password: password.trim()}));
    }
  };

  const handleResetPassword = () => {
    if (checkValue(true)) {
      dispatch(resetPassword({email}));
    }
  };

  const checkValue = (isResetPassword: boolean) => {
    if (!checkEmail(email.trim())) {
      dispatch(
        setMessage({
          message: 'Email not accepted',
          type: 'Error',
        }),
      );
      return false;
    }
    if (!isResetPassword && password.trim().length < 8) {
      dispatch(
        setMessage({
          message: 'Password must be at least 8 characters long',
          type: 'Error',
        }),
      );
      return false;
    }

    return true;
  };

  useEffect(() => {
    dispatch(clearStatus());
  }, []);

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
              ref={emailRef}
              onSubmitEditing={() => {
                if (passwordRef.current) {
                  passwordRef.current.focus();
                }
              }}
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
              ref={passwordRef}
              onSubmitEditing={handleLogin}
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
            label={resetPasswordLoading ? '' : 'Reset Password'}
            backgroundColor={Colors.grey20}
            white
            onPress={handleResetPassword}
            borderRadius={8}
            text70BL
            disabled={resetPasswordLoading}>
            {resetPasswordLoading && (
              <View row center>
                <Text />
                <LoaderScreen color={Colors.white} size={'small'} />
              </View>
            )}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
