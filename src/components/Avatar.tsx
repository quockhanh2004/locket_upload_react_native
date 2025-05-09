/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, Avatar, Icon, Colors} from 'react-native-ui-lib';

interface CustomAvatarProps {
  url?: string;
  size: number;
  text?: string;
  border?: boolean;
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  url,
  size,
  text,
  border,
}) => {
  if (url) {
    return (
      <Avatar
        source={{uri: url}}
        size={size}
        imageStyle={{
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: border ? Colors.primary : 'transparent',
        }}
      />
    );
  } else {
    return (
      <View
        center
        bg-grey20
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: border ? Colors.primary : 'transparent',
        }}>
        {text && (
          <Text white text70BL center>
            {text}
          </Text>
        )}
        {!text && <Icon assetName="ic_group" size={size} />}
      </View>
    );
  }
};

export default CustomAvatar;
