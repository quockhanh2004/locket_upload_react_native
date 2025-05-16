import React from 'react';
import {
  View,
  TouchableOpacity,
  Icon,
  Colors,
  Text,
  Typography,
} from 'react-native-ui-lib';
import {nav} from '../navigation/navName';
import {hapticFeedback} from '../util/haptic';
import {navigationTo} from '../navigation/HomeNavigation';

interface HeaderProps {
  title?: string;
  rightIcon?: string;
  rightIconAction?: () => void;
  leftIconAction?: () => void;

  //custom component
  backgroundColor?: string;
  customCenter?: React.ReactNode;
}

const Header = ({
  title,
  customCenter,
  rightIcon,
  backgroundColor,
  rightIconAction,
  leftIconAction,
}: HeaderProps) => {
  const handleBack = () => {
    hapticFeedback();
    if (leftIconAction) {
      leftIconAction();
      return;
    }
    navigationTo(nav.home);
  };

  return (
    <View
      bg-black
      row
      spread
      paddingH-20
      paddingT-20
      centerV
      backgroundColor={backgroundColor}>
      <TouchableOpacity onPress={handleBack} padding-6>
        <Icon
          assetGroup="icons"
          assetName="ic_back"
          tintColor={Colors.grey40}
          size={24}
        />
      </TouchableOpacity>
      {customCenter ? (
        customCenter
      ) : (
        <Text
          white
          style={{
            ...Typography.text60BL,
          }}>
          {title}
        </Text>
      )}
      {rightIcon ? (
        <TouchableOpacity onPress={rightIconAction} padding-6>
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
