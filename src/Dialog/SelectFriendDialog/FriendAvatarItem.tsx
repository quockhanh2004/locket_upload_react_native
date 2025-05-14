/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {TouchableOpacity} from 'react-native-ui-lib';
import {Text, View, Avatar} from 'react-native-ui-lib';
import {stylesSelected} from './constants';
import {Friend} from '../../models/friend.model';

interface Props {
  item: Friend;
  isSelected: boolean;
  onPress: () => void;
}

const FriendAvatarItem: React.FC<Props> = ({item, isSelected, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} center style={{width: 80, height: 80}}>
      <View center style={isSelected ? stylesSelected : undefined}>
        {item.profile_picture_url ? (
          <Avatar source={{uri: item?.profile_picture_url}} size={30} />
        ) : (
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: '#000',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text text80BL white>
              {item.first_name?.at(0)}
              {item.last_name?.at(0)}
            </Text>
          </View>
        )}
      </View>
      <Text white text90 center numberOfLines={1}>
        {item.first_name}
      </Text>
    </TouchableOpacity>
  );
};

export default FriendAvatarItem;
