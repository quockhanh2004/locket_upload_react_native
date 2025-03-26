import React from 'react';
import {
  View,
  TouchableOpacity,
  Icon,
  Colors,
  Text,
  Typography,
} from 'react-native-ui-lib';
import {useNavigation} from '@react-navigation/native';

interface HeaderProps {
  title?: string;
  rightIcon?: string;
  rightIconAction?: () => void;
  leftIconAction?: () => void;
}

const Header = ({
  title,
  rightIcon,
  rightIconAction,
  leftIconAction,
}: HeaderProps) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (leftIconAction) {
      leftIconAction();
      return;
    }
    navigation.goBack();
  };

  return (
    <View bg-black row spread paddingH-20 paddingT-20>
      <TouchableOpacity onPress={handleBack}>
        <Icon
          assetGroup="icons"
          assetName="ic_back"
          tintColor={Colors.grey40}
          size={24}
        />
      </TouchableOpacity>
      <Text
        white
        style={{
          ...Typography.text60BL,
        }}>
        {title}
      </Text>
      {rightIcon ? (
        <TouchableOpacity onPress={rightIconAction}>
          <Icon
            assetGroup="icons"
            assetName={rightIcon}
            tintColor={Colors.grey40}
            size={24}
          />
        </TouchableOpacity>
      ) : (
        <View width={24} height={24} />
      )}
    </View>
  );
};

export default Header;
