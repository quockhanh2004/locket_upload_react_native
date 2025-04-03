import {createAsyncThunk} from '@reduxjs/toolkit';
import {getListFriend, getListIdFriend} from '../../util/Friends';
import {setMessage} from '../slice/message.slice';

interface DataParam {
  idUser: string;
  idToken: string;
}

export const getFriends = createAsyncThunk(
  'getListFriend',
  async (data: DataParam, thunkApi) => {
    try {
      const listFriendId = await getListIdFriend(data.idToken, data.idUser);
      const listFriend = await getListFriend(data.idToken, listFriendId);
      return listFriend;
    } catch (error: any) {
      console.error('Error fetching list friend', error);
      thunkApi.dispatch(
        setMessage({
          message: `Error: ${error.message}`,
          type: 'error',
        }),
      );
      return thunkApi.rejectWithValue(error);
    }
  },
);
