/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  Button,
  Colors,
  Typography,
  LoaderScreen,
  TextField,
  TextFieldRef,
} from 'react-native-ui-lib';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../redux/store';

import {login, resetPassword} from '../redux/action/user.action';
import {setMessage} from '../redux/slice/message.slice';
import {checkEmail} from '../util/regex';
import {clearStatus} from '../redux/slice/user.slice';
import {t} from 'i18next';

const LoginScreen = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {isLoading, resetPasswordLoading} = useSelector(
    (state: RootState) => state.user,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailRef = useRef<TextFieldRef>(null);
  const passwordRef = useRef<TextFieldRef>(null);

  const handleLogin = async () => {
    if (checkValue(false)) {
      dispatch(login({email: email.trim(), password: password.trim()}));
    }
  };

  const handleResetPassword = () => {
    if (checkValue(true)) {
      dispatch(resetPassword({email: email.trim()}));
    }
  };

  const checkValue = (isResetPassword: boolean) => {
    if (!checkEmail(email.trim())) {
      dispatch(
        setMessage({
          message: t('email_not_accepted'),
          type: t('error'),
        }),
      );
      return false;
    }
    if (!isResetPassword && password.trim().length < 8) {
      dispatch(
        setMessage({
          message: t('password_short'),
          type: t('error'),
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
            <TextField
              ref={emailRef}
              value={email}
              cursorColor={Colors.primary}
              paddingV-8
              containerStyle={{
                gap: 8,
              }}
              fieldStyle={{
                paddingLeft: 10,
                borderColor: Colors.grey20,
                borderWidth: 2,
                borderRadius: 10,
              }}
              label="Email"
              labelColor={Colors.white}
              labelStyle={{...Typography.text70BL}}
              placeholder="Email"
              placeholderTextColor={Colors.grey40}
              onChangeText={setEmail}
              color={Colors.grey60}
              showClear={email.length > 0}
              showClearButton
              inputMode="email"
              onSubmitEditing={() => {
                if (passwordRef.current) {
                  passwordRef.current.focus();
                }
              }}
            />
          </View>
          <View gap-8>
            <TextField
              value={password}
              onChangeText={setPassword}
              eyePassword={true}
              paddingV-8
              containerStyle={{
                gap: 8,
              }}
              fieldStyle={{
                paddingLeft: 10,
                borderColor: Colors.grey20,
                borderWidth: 2,
                borderRadius: 10,
              }}
              label="Password"
              labelColor={Colors.white}
              labelStyle={{...Typography.text70BL}}
              placeholder="Password"
              placeholderTextColor={Colors.grey40}
              color={Colors.grey60}
              showClear={password.length > 0}
              ref={passwordRef}
              onSubmitEditing={handleLogin}
              secureTextEntry
              showClearButton
              endAdornment
            />
          </View>
        </View>

        <View gap-10>
          <Button
            label={!isLoading ? t('login') : ''}
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
            label={resetPasswordLoading ? '' : t('reset_password')}
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
