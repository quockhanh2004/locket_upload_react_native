import React from 'react';
import {View, Text, Switch} from 'react-native-ui-lib';
import Header from '../components/Header';
import {FlatList, ToastAndroid} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setUseCameraSetting} from '../redux/slice/setting.slice';
import {RootState} from '../redux/store';
import MainButton from '../components/MainButton';
import {deleteAllMp4Files} from '../util/uploadVideo';
import {clearPostMoment} from '../redux/slice/postMoment.slice';

const SettingScreen = () => {
  const dispatch = useDispatch();
  const {useCamera} = useSelector((state: RootState) => state.setting);

  const handleSwitchUseCamera = (value: boolean) => {
    dispatch(setUseCameraSetting(value));
  };

  const handleClearCache = async () => {
    let totalSize = 0;
    totalSize +=
      (await deleteAllMp4Files('/data/user/0/com.locket_upload/files/')) || 0;
    totalSize +=
      (await deleteAllMp4Files('/data/user/0/com.locket_upload/cache/')) || 0;
    dispatch(clearPostMoment());
    ToastAndroid.show(
      `Dọn dẹp bộ nhớ hoàn tất (${totalSize.toFixed(1)}Mb)`,
      ToastAndroid.SHORT,
    );
  };

  return (
    <View flex>
      <Header title={'Setting'} />
      <View bg-black flex paddingT-40 paddingH-12>
        <FlatList
          data={settingOptions}
          renderItem={({item, index}) => {
            return (
              <>
                <View key={index} row spread paddingV-8>
                  <Text white text70BL>
                    {item.title}
                  </Text>
                  <Switch
                    value={useCamera || false}
                    onValueChange={handleSwitchUseCamera}
                  />
                </View>
                <View height={1} bg-grey40 />
              </>
            );
          }}
          ListFooterComponent={
            <View marginT-20>
              <MainButton
                onPress={handleClearCache}
                label={'Xóa bộ nhớ đệm'}
                isLoading={undefined}
              />
            </View>
          }
        />
      </View>
    </View>
  );
};

export default SettingScreen;

const settingOptions = [{title: 'Sử dụng camera', key: 'useCamera'}];
