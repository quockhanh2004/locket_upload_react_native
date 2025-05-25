/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../redux/store';
import {Colors, Icon, Text, TouchableOpacity, View} from 'react-native-ui-lib';
import {t} from '../languages/i18n';
import MainInput from '../components/MainInput';
import MainButton from '../components/MainButton';
import {hapticFeedback} from '../util/haptic';
import {Linking, ScrollView} from 'react-native';
import {activeKey, getActiveKey} from '../redux/action/setting.action';
import {setActiveKey as sliceActiveKey} from '../redux/slice/setting.slice';
import {logout} from '../redux/slice/user.slice';

interface ActiveAppScreenProps {}

const ActiveAppScreen: React.FC<ActiveAppScreenProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.user);
  const userEmail = user?.email;
  const [isFocus, setIsFocus] = useState(false);
  const [keyActive, setKeyActive] = useState('');
  //timeout để gửi lại mail là 30s
  const [timeoutSend, setTimeoutSend] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userEmail) {
      return;
    }
    if (userEmail === process.env.EMAIL_DEMO) {
      dispatch(
        sliceActiveKey({
          email: userEmail,
          key: process.env.KEY_DEMO || '',
        }),
      );
    }
  }, [dispatch, userEmail]);

  const handlePressFacebook = useCallback(() => {
    hapticFeedback();
    Linking.openURL('https://www.facebook.com/profile.php?id=61575901494417');
  }, []);

  const handleActive = () => {
    hapticFeedback();
    if (!keyActive || !userEmail) {
      return;
    }
    dispatch(
      activeKey({
        email: userEmail,
        key: keyActive,
      }),
    );
  };

  const handleGetKey = () => {
    hapticFeedback();
    if (!userEmail) {
      return;
    }
    dispatch(getActiveKey(userEmail));
    setTimeoutSend(30000);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setTimeoutSend(prev => {
        if (prev <= 1000) {
          clearInterval(intervalRef.current!); // Dừng interval khi đếm xong
          intervalRef.current = null;
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  };

  const handleLogout = () => {
    hapticFeedback();
    dispatch(logout());
  };
  return (
    <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
      <View flex center bg-black>
        <View paddingH-20 paddingV-40 gap-8>
          <Text white text60BL>
            {t('active_key_required')}
          </Text>

          <TouchableOpacity onPress={handlePressFacebook}>
            <View row gap-8>
              <Icon
                assetGroup="icons"
                assetName="ic_facebook"
                tintColor={Colors.blue20}
                size={24}
              />
              <Text blue20 text70BL>
                Locket Upload
              </Text>
            </View>
          </TouchableOpacity>

          <View paddingH-8 paddingV-4 gap-8 marginT-20>
            <Text white text60BL>
              {t('active_key_description')} {userEmail}
            </Text>
            <MainInput
              value={keyActive}
              onChangeText={setKeyActive}
              placeholder={t('active_key')}
              placeholderTextColor={Colors.grey20}
              onFocus={setIsFocus}
            />
          </View>
          <View flex spread>
            <View gap-8>
              {!isFocus && (
                <MainButton
                  label={
                    timeoutSend > 0
                      ? `${t('get_acitve_key')} (${timeoutSend / 1000})`
                      : t('get_acitve_key')
                  }
                  onPress={handleGetKey}
                  disabled={timeoutSend > 0}
                />
              )}
              <MainButton
                onPress={handleActive}
                label={t('active')}
                disabled={keyActive.length === 0}
              />
            </View>
            {!isFocus && (
              <MainButton
                label={t('logout')}
                onPress={handleLogout}
                backgroundColor={Colors.red30}
              />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ActiveAppScreen;
