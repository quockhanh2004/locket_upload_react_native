/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Avatar,
  TouchableOpacity,
  Icon,
  Colors,
  Text,
} from 'react-native-ui-lib';
import {Friend} from '../../models/friend.model';
import FriendPicker from '../Moment/FriendPicker';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';

interface Props {
  userInfo: any;
  user: any;
  currentPage: 'form' | 'screen';
  filterFriendShow: Friend | null;
  onSelectFriend: (friend: Friend | null) => void;
  onViewProfile: () => void;
  onViewPost: () => void;
}

const HomeScreenHeader = ({
  userInfo,
  user,
  currentPage,
  filterFriendShow,
  onSelectFriend,
  onViewProfile,
  onViewPost,
}: Props) => {
  const {friends} = useSelector((state: RootState) => state.friends);
  const {listChat} = useSelector((state: RootState) => state.chat);

  //tính số lượng tin nhắn chưa đọc
  const unreadMessages = Object.values(listChat)?.filter(
    message => message.is_read === false,
  );
  return (
    <View row spread centerV padding-12>
      {userInfo?.photoUrl ? (
        <Avatar
          source={{uri: userInfo?.photoUrl || undefined}}
          size={36}
          onPress={onViewProfile}
        />
      ) : (
        <TouchableOpacity
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: Colors.grey40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={onViewProfile}>
          <Text white text80BL>
            {userInfo?.firstName?.at(0)}
            {userInfo?.lastName?.at(0)}
          </Text>
        </TouchableOpacity>
      )}

      {currentPage === 'screen' && user && (
        <View height={36}>
          <FriendPicker
            friends={friends}
            onSelect={onSelectFriend}
            user={user}
            value={filterFriendShow}
          />
        </View>
      )}

      <TouchableOpacity onPress={onViewPost}>
        <View
          width={36}
          height={36}
          center
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors.grey40,
          }}>
          <Icon
            assetGroup="icons"
            assetName="ic_message"
            size={24}
            tintColor={Colors.grey40}
          />

          {unreadMessages?.length > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: Colors.red30,
                width: 16,
                height: 16,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text white text90>
                {unreadMessages.length}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreenHeader;
