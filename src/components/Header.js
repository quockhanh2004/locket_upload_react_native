import {View, TouchableOpacity, Icon, Colors} from 'react-native-ui-lib';
import React from 'react';
import {useNavigation} from '@react-navigation/native';

const Header = () => {
  const navigation = useNavigation();
  const handleBack = () => {
    navigation.goBack();
  };
  return (
    <View bg-black absT paddingH-20 paddingT-20>
      <TouchableOpacity onPress={handleBack}>
        <Icon
          assetGroup="icons"
          assetName="ic_back"
          tintColor={Colors.grey40}
          size={24}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
