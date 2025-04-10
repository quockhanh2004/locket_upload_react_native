/* eslint-disable react-native/no-inline-styles */
// components/SelectFriendDialog/FriendAvatarItem.tsx
import React from 'react';
import {TouchableOpacity} from 'react-native-ui-lib';
import {Text, View, Avatar} from 'react-native-ui-lib';
import {stylesSelected} from './constants';

interface Props {
  item: any;
  isSelected: boolean;
  onPress: () => void;
}

const FriendAvatarItem: React.FC<Props> = ({item, isSelected, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} center style={{width: 80, height: 80}}>
      <View center style={isSelected ? stylesSelected : undefined}>
        <Avatar source={{uri: item?.profile_picture_url}} size={30} />
      </View>
      <Text white text90 center numberOfLines={1}>
        {item.first_name}
      </Text>
    </TouchableOpacity>
  );
};

export default FriendAvatarItem;
