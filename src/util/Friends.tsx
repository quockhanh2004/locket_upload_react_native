/* eslint-disable no-async-promise-executor */
import axios from 'axios';
import {fetchUser} from '../api/user.api';
import {Friend} from '../models/friend.model';
import {MY_SERVER_URL} from './constrain';

export const getListIdFriend = async (token: string) => {
  const response = await axios.post(`${MY_SERVER_URL}/listen`, {
    token,
  });
  return response.data.users;
};

export const getListFriend = (
  token: string,
  listIdFriend: string[],
): Promise<Friend[]> => {
  const friendPromises = listIdFriend.map(friendId => {
    return new Promise<Friend>(async (resolve, reject) => {
      try {
        const response = await fetchUser(friendId, token);

        const data = response.data.result.data as Friend;

        // Kiểm tra dữ liệu hợp lệ trước khi resolve promise
        if (data && data.uid) {
          resolve(data); // Resolve với dữ liệu bạn bè
        } else {
          reject(new Error(`Friend data for ${friendId} is invalid.`));
        }
      } catch (error) {
        reject(error); // Reject với lỗi nếu có
      }
    });
  });

  // Chờ tất cả các promises hoàn thành và trả về mảng bạn bè
  return Promise.all(friendPromises)
    .then(friends => friends)
    .catch(error => {
      console.error('Error fetching friends:', error.response?.data);
      throw error;
    });
};
