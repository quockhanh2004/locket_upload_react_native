import React, {useCallback} from 'react';
import {FlatList, ToastAndroid} from 'react-native';
import {View, Text, Switch, Colors} from 'react-native-ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import RNFS from 'react-native-fs';

import Header from '../components/Header';
import MainButton from '../components/MainButton';
import {deleteAllMp4Files} from '../util/uploadVideo';
import {
  setUseCameraSetting,
  setOptionFriend,
  setUnlimitedTrimVideo,
  setTrySoftwareEncode,
} from '../redux/slice/setting.slice';
import {clearPostMoment} from '../redux/slice/postMoment.slice';
import {RootState} from '../redux/store';
import {logout} from '../redux/slice/user.slice';
import {setOldPosts} from '../redux/slice/oldPosts.slice';
import {setFriends} from '../redux/slice/friends.slice';
import {useNavigation} from '@react-navigation/native';
import {clearTokenData} from '../redux/slice/spotify.slice';

const SettingScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const {tokenData} = useSelector((state: RootState) => state.spotify);
  const {useCamera, optionFriend, unlimitedTrimVideo, trySoftwareEncode} =
    useSelector((state: RootState) => state.setting);

  const settingOptions = [
    {
      title: 'Sử dụng camera',
      value: useCamera,
      action: setUseCameraSetting,
    },
    {
      title: 'Nhiều lựa chọn bạn bè',
      value: optionFriend,
      action: setOptionFriend,
    },
    {
      title:
        'Cắt video nhiều hơn 7 giây \n(có thể làm giảm chất lượng rất nhiều)',
      value: unlimitedTrimVideo,
      action: setUnlimitedTrimVideo,
    },
    {
      title:
        'Sử dụng phần mềm mã hóa video \n(có thể 1 số thiết bị sẽ không xem được video)',
      value: trySoftwareEncode,
      action: setTrySoftwareEncode,
    },
  ];

  const handleToggle = useCallback(
    (value: boolean, action: (val: boolean) => any) => {
      dispatch(action(value));
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
      `Dọn dẹp bộ nhớ hoàn tất (${totalSize.toFixed(1)}Mb)`,
      ToastAndroid.SHORT,
    );
  }, [dispatch]);

  return (
    <View flex bg-black paddingB-16>
      <Header
        title="Cài đặt"
        leftIconAction={() => {
          navigation.goBack();
        }}
      />
      <View bg-black flex paddingT-40 paddingH-12>
        <FlatList
          data={settingOptions}
          keyExtractor={item => item.title}
          renderItem={({item}) => (
            <>
              <View row spread paddingV-8>
                <Text white text70BL flexS>
                  {item.title}
                </Text>
                <Switch
                  value={item.value}
                  onColor={Colors.primary}
                  onValueChange={value => handleToggle(value, item.action)}
                />
              </View>
              <View height={1} bg-grey40 />
            </>
          )}
          ListFooterComponent={
            <>
              <View marginT-20 gap-8>
                <MainButton onPress={handleClearCache} label="Xóa bộ nhớ đệm" />
                {tokenData && (
                  <MainButton
                    label="Đăng xuất Spotify"
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
        label="Đăng xuất"
        backgroundColor={Colors.red30}
        lableColor={Colors.white}
        onPress={() => {
          dispatch(logout());
          dispatch(setOldPosts([]));
          dispatch(setFriends([]));
        }}
      />
    </View>
  );
};

export default SettingScreen;
