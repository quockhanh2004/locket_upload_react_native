import React from 'react';
import {Friend} from '../../models/friend.model';
import Header from '../../components/Header';
import FriendPicker from './FriendPicker';
import {Colors} from 'react-native-ui-lib';
import {navigationTo} from '../Home';
import {nav} from '../../navigation/navName';

interface PostScreenHeaderProps {
  friends: Friend[];
  user: any;
  filterFriendShow: Friend | null;
  setFilterFriendShow: (friend: Friend | null) => void;
  leftIconAction?: () => void;
}

const PostScreenHeader: React.FC<PostScreenHeaderProps> = ({
  friends,
  user,
  filterFriendShow,
  setFilterFriendShow,
  leftIconAction,
}) => {
  return (
    <Header
      customCenter={
        <FriendPicker
          friends={friends}
          onSelect={setFilterFriendShow}
          user={user}
          value={filterFriendShow}
        />
      }
      backgroundColor={Colors.transparent}
      leftIconAction={leftIconAction}
      rightIcon="ic_message"
      rightIconAction={() => {
        navigationTo(nav.chatList);
      }}
    />
  );
};

export default PostScreenHeader;
