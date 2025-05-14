import React from 'react';
import {Friend} from '../../models/friend.model';
import Header from '../../components/Header';
import FriendPicker from './FriendPicker';
import {Colors} from 'react-native-ui-lib';

interface PostScreenHeaderProps {
  friends: {
    [key: string]: Friend;
  };
  user: any;
  filterFriendShow: Friend | null;
  setFilterFriendShow: (friend: Friend | null) => void;
  leftIconAction?: () => void;
  rightIconAction?: () => void;
}

const PostScreenHeader: React.FC<PostScreenHeaderProps> = ({
  friends,
  user,
  filterFriendShow,
  setFilterFriendShow,
  leftIconAction,
  rightIconAction,
}) => {
  //chuyển object friend thành mảng
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
      rightIconAction={rightIconAction}
    />
  );
};

export default PostScreenHeader;
