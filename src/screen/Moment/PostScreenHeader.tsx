import React from 'react';
import {Friend} from '../../models/friend.model';
import Header from '../../components/Header';
import FriendPicker from './FriendPicker';

interface PostScreenHeaderProps {
  friends: Friend[];
  user: any;
  filterFriendShow: Friend | null;
  setFilterFriendShow: (friend: Friend | null) => void;
}

const PostScreenHeader: React.FC<PostScreenHeaderProps> = ({
  friends,
  user,
  filterFriendShow,
  setFilterFriendShow,
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
    />
  );
};

export default PostScreenHeader;
