/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../redux/store';
import {Colors, Icon, Text, TouchableOpacity, View} from 'react-native-ui-lib';
import {t} from '../languages/i18n';
import MainInput from '../components/MainInput';
import MainButton from '../components/MainButton';
import {hapticFeedback} from '../util/haptic';
import {Linking, ScrollView} from 'react-native';
import {activeKey} from '../redux/action/setting.action';
import {logout} from '../redux/slice/user.slice';

interface ActiveAppScreenProps {}

const ActiveAppScreen: React.FC<ActiveAppScreenProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.user);
  const userEmail = user?.email;
  const [isFocus, setIsFocus] = useState(false);
  const [keyActive, setKeyActive] = useState('');

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
            <MainButton
              onPress={handleActive}
              label={t('active')}
              disabled={keyActive.length === 0}
            />
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
