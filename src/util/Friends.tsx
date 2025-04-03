import axios from 'axios';
import {Friend} from '../redux/slice/friends.slice';

export const getListIdFriend = async (token: string, userId: string) => {
  const response = await axios.post(
    'https://file.quockhanh020924.id.vn/listen',
    {
      token,
      userId,
    },
  );
  return response.data.users;
};

export const getListFriend = async (token: string, listIdFriend: string[]) => {
  const friends: Friend[] = [];
  for (const friend of listIdFriend) {
    const response = await axios.post(
      'https://api.locketcamera.com/fetchUserV2',
      {
        data: {
          user_uid: friend,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = response.data.result.data as Friend;

    friends.push(data);
  }

  return friends;
};
