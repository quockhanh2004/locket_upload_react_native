/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useCallback} from 'react';
import {
  View,
  Text,
  Image,
  GridList,
  Spacings,
  TouchableOpacity,
  Colors,
} from 'react-native-ui-lib';
import {iconAliases, AliasName, switchAppIcon} from '../util/SwitchIconApp';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../redux/store';
import Header from '../components/Header';
import {useNavigation} from '@react-navigation/native';
import {setCustomIcon} from '../redux/slice/setting.slice';
import {t} from '../languages/i18n';

interface SelectIconScreenProps {}

type IconAliasItem = {name: string; value: AliasName};

const SelectIconScreen: React.FC<SelectIconScreenProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const {customIcon} = useSelector((state: RootState) => state.setting);

  const handleChangeIcon = (icon: AliasName) => {
    dispatch(setCustomIcon(icon));
    switchAppIcon(icon);
  };

  const renderGridItem = useCallback(
    ({item}: {item: IconAliasItem}) => {
      const isSelected = customIcon === item.value;
      return (
        <TouchableOpacity
          center
          padding-s2
          onPress={() => {
            handleChangeIcon(item.value);
          }}
          style={[
            {borderRadius: 8},
            isSelected && {
              backgroundColor: Colors.grey70,
              borderWidth: 2,
              borderColor: Colors.blue30,
            },
          ]}
          marginV-s1
          marginH-s1
          accessibilityLabel={`Select icon ${item.name}`}>
          <Image
            assetGroup="ic_app"
            assetName={item.value}
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
            }}
          />
          <Text
            text80
            center
            marginT-xs
            numberOfLines={2}
            grey10
            style={isSelected && {color: Colors.blue30, fontWeight: 'bold'}}>
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [customIcon],
  );

  return (
    <View flex bg-black>
      <Header
        title={t('change_app_icon')}
        leftIconAction={() => {
          navigation.goBack();
        }}
      />
      <GridList<IconAliasItem>
        data={iconAliases}
        renderItem={renderGridItem}
        numColumns={4} // Số cột mong muốn
        itemSpacing={Spacings.s2} // Khoảng cách giữa các item (ngang và dọc)
        listPadding={Spacings.s4} // Padding xung quanh toàn bộ GridList
        keyExtractor={item => item.value} // Key duy nhất cho mỗi item
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default SelectIconScreen;
