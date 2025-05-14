/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {FlatList} from 'react-native';
import {Icon, Text, View, TouchableOpacity, Colors} from 'react-native-ui-lib';
import FriendAvatarItem from './FriendAvatarItem';

interface Props {
  friends: any[];
  selected: string[];
  customListFriends: string[];
  optionSend: string;
  onSelectAll: () => void;
  onSelectFriend: (uid: string) => void;
}

const FriendAvatarList: React.FC<Props> = ({
  friends,
  selected,
  customListFriends,
  optionSend,
  onSelectAll,
  onSelectFriend,
}) => {
  return (
    <FlatList
      horizontal
      ListHeaderComponent={
        <TouchableOpacity
          onPress={onSelectAll}
          center
          style={{width: 80, height: 80, marginBottom: 10}}>
          <View
            center
            width={50}
            height={50}
            style={
              ((optionSend === 'manual' && selected.length === 0) ||
                (optionSend === 'custom_list' &&
                  customListFriends.length === 0)) && {
                borderWidth: 2,
                borderColor: Colors.primary,
                borderRadius: 99,
                padding: 2,
              }
            }>
            <Icon
              assetGroup="icons"
              assetName="ic_group"
              size={25}
              tintColor={Colors.white}
            />
          </View>
          <Text white text90 center numberOfLines={1}>
            Tất cả
          </Text>
        </TouchableOpacity>
      }
      data={friends}
      renderItem={({item}) => {
        const isSelected =
          optionSend === 'custom_list'
            ? customListFriends.includes(item.uid) ||
              customListFriends.length === 0
            : selected.includes(item.uid) || selected.length === 0;
        return (
          <FriendAvatarItem
            item={item}
            isSelected={isSelected}
            onPress={() => onSelectFriend(item.uid)}
          />
        );
      }}
    />
  );
};

export default FriendAvatarList;
