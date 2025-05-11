import React, {useCallback} from 'react';
import {FlatList, ToastAndroid} from 'react-native';
import {View, Text, Colors} from 'react-native-ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import RNFS from 'react-native-fs';

import Header from '../../components/Header';
import MainButton from '../../components/MainButton';
import {deleteAllMp4Files} from '../../util/uploadVideo';
import {
  setUseCameraSetting,
  setOptionFriend,
  setUnlimitedTrimVideo,
  setTrySoftwareEncode,
} from '../../redux/slice/setting.slice';
import {clearPostMoment} from '../../redux/slice/postMoment.slice';
import {AppDispatch, RootState} from '../../redux/store';
import {logout} from '../../redux/slice/user.slice';
import {setOldPosts} from '../../redux/slice/oldPosts.slice';
import {setFriends} from '../../redux/slice/friends.slice';
import {useNavigation} from '@react-navigation/native';
import {clearTokenData} from '../../redux/slice/spotify.slice';
import {t} from '../../languages/i18n';
import {setLanguage} from '../../redux/slice/language.slice';
import {TextSwitch} from '../../components/TextSwitch';
import {Language} from '../../models/language.model';
import ItemSetting from './ItemSetting';
import {ItemSettingModel} from '../../models/itemSetting.model';
import {clearListChat} from '../../redux/slice/chat.slice';
import {getSocket} from '../../services/Chat';

const SettingScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const socket = getSocket();

  const {language} = useSelector((state: RootState) => state.language);
  const {tokenData} = useSelector((state: RootState) => state.spotify);
  const {useCamera, optionFriend, unlimitedTrimVideo, trySoftwareEncode} =
    useSelector((state: RootState) => state.setting);

  const settingOptions: ItemSettingModel[] = [
    {
      title: t('use_camera'),
      value: useCamera,
      action: setUseCameraSetting,
    },
    {
      title: t('multi_option_friend'),
      value: optionFriend,
      action: setOptionFriend,
    },
    {
      title: t('unlimited_trim_video'),
      value: unlimitedTrimVideo,
      action: setUnlimitedTrimVideo,
    },
    {
      title: t('use_software_encode_video'),
      value: trySoftwareEncode,
      action: setTrySoftwareEncode,
    },
    // {
    //   title: t('change_app_icon'),
    //   type: 'button',
    //   action: () => {
    //     navigationTo(nav.selectIcon);
    //   },
    // },
  ];

  const handleToggle = useCallback(
    (
      action: (val?: boolean) => any,
      value?: boolean,
      type?: 'button' | 'switch',
    ) => {
      if (type === 'button') {
        action();
        return;
      }
      dispatch(action(value || false));
    },
    [dispatch],
  );

  const handleSpotifyLogout = useCallback(() => {
    dispatch(clearTokenData());
  }, [dispatch]);

  const handleClearCache = useCallback(async () => {
    let totalSize = 0;
    totalSize += (await deleteAllMp4Files(RNFS.DocumentDirectoryPath)) || 0;
    totalSize += (await deleteAllMp4Files(RNFS.CachesDirectoryPath)) || 0;

    dispatch(clearPostMoment());
    ToastAndroid.show(
      `${t('clean_cache_complete')} (${totalSize.toFixed(1)}Mb)`,
      ToastAndroid.SHORT,
    );
  }, [dispatch]);

  return (
    <View flex bg-black paddingB-16>
      <Header
        title={t('setting')}
        leftIconAction={() => {
          navigation.goBack();
        }}
      />
      <View bg-black flex paddingT-40 paddingH-12>
        <FlatList
          data={settingOptions}
          keyExtractor={item => item.title}
          renderItem={({item}) => (
            <ItemSetting
              item={item}
              onPress={(action, val) => {
                handleToggle(action as (val?: boolean) => any, val, item.type);
              }}
            />
          )}
          ListFooterComponent={
            <>
              <View row spread paddingV-8 centerV>
                <Text white text70BL flexS>
                  {t('language')}
                </Text>
                <View width={'40%'}>
                  <TextSwitch
                    onChange={(val: string) => {
                      dispatch(setLanguage(val as Language));
                    }}
                    option={[Language.EN, Language.VI]}
                    value={language}
                  />
                </View>
              </View>

              <View height={1} bg-grey40 />

              <View marginT-20 gap-8>
                <MainButton
                  onPress={handleClearCache}
                  label={t('clean_cache')}
                />
                {tokenData && (
                  <MainButton
                    label={t('logout_spotify')}
                    onPress={handleSpotifyLogout}
                    backgroundColor={Colors.spotify}
                  />
                )}
              </View>
            </>
          }
        />
      </View>
      <MainButton
        label={t('logout')}
        backgroundColor={Colors.red30}
        lableColor={Colors.white}
        onPress={() => {
          dispatch(logout());
          dispatch(setOldPosts([]));
          dispatch(setFriends([]));
          dispatch(clearListChat());
          socket?.disconnect();
        }}
      />
    </View>
  );
};

export default SettingScreen;
