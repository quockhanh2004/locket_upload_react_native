import React from 'react';
import {View, Text, Switch} from 'react-native-ui-lib';
import Header from '../components/Header';
import {FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setUseCameraSetting} from '../redux/slice/setting.slice';

const SettingScreen = () => {
  const dispatch = useDispatch();
  const {useCamera} = useSelector(state => state.setting);

  const handleSwitchUseCamera = value => {
    dispatch(setUseCameraSetting(value));
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
        />
      </View>
    </View>
  );
};

export default SettingScreen;

const settingOptions = [{title: 'Sử dụng camera', key: 'useCamera'}];
