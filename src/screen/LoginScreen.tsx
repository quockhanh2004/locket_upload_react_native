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
  TouchableOpacity,
  Icon,
} from 'react-native-ui-lib';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../redux/store';

import {login, loginPhone, resetPassword} from '../redux/action/user.action';
import {setMessage} from '../redux/slice/message.slice';
import {checkEmail, checkPhoneNumber} from '../util/regex';
import {clearStatus} from '../redux/slice/user.slice';
import {t} from 'i18next';
import {Linking} from 'react-native';
import {TextSwitch} from '../components/TextSwitch';
import {hapticFeedback} from '../util/haptic';

const LoginScreen = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {isLoading, resetPasswordLoading} = useSelector(
    (state: RootState) => state.user,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginOption, setloginOption] = useState<'Email' | 'Phone'>('Email');

  const emailRef = useRef<TextFieldRef>(null);
  const passwordRef = useRef<TextFieldRef>(null);

  const handleLogin = async () => {
    if (checkValue(false)) {
      if (loginOption === 'Phone') {
        dispatch(loginPhone({email: email.trim(), password: password.trim()}));
      } else {
        dispatch(login({email: email.trim(), password: password.trim()}));
      }
    }
  };

  const handlePressGithub = useCallback(() => {
    hapticFeedback();
    Linking.openURL('https://github.com/quockhanh2004/');
  }, []);

  const handlePressFacebook = useCallback(() => {
    hapticFeedback();
    Linking.openURL('https://www.facebook.com/profile.php?id=61575901494417');
  }, []);

  const handleResetPassword = () => {
    if (checkValue(true)) {
      dispatch(resetPassword({email: email.trim()}));
    }
  };

  const checkValue = (isResetPassword: boolean) => {
    if (loginOption === 'Email' && !checkEmail(email.trim())) {
      dispatch(
        setMessage({
          message: t('email_not_accepted'),
          type: t('error'),
        }),
      );
      return false;
    }
    if (loginOption === 'Phone' && !checkPhoneNumber(email.trim())) {
      dispatch(
        setMessage({
          message: t('phone_not_accepted'),
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

  const handleSwitchLoginOption = (value: string) => {
    setloginOption(value as 'Email' | 'Phone');
    if (value === 'Phone') {
      setEmail('+84');
    } else {
      setEmail('');
    }
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
          <View width={'40%'}>
            <TextSwitch
              value={loginOption}
              option={['Email', 'Phone']}
              onChange={handleSwitchLoginOption}
            />
          </View>
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
              label={loginOption}
              labelColor={Colors.white}
              labelStyle={{...Typography.text70BL}}
              placeholder={loginOption}
              placeholderTextColor={Colors.grey40}
              onChangeText={setEmail}
              color={Colors.grey60}
              showClear={email.length > 0}
              showClearButton
              inputMode={loginOption === 'Phone' ? 'tel' : 'email'}
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
        <View gap-12>
          <TouchableOpacity onPress={handlePressGithub}>
            <View center row gap-8>
              <Icon
                assetGroup="icons"
                assetName="ic_github"
                tintColor={Colors.grey30}
                size={20}
              />
              <Text grey30>quockhanh2004</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePressFacebook}>
            <View center row gap-8>
              <Icon
                assetGroup="icons"
                assetName="ic_facebook"
                tintColor={Colors.grey30}
                size={25}
              />
              <Text grey30>Locket Upload</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
