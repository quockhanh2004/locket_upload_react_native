import {createAsyncThunk} from '@reduxjs/toolkit';
import {getListFriend, getListIdFriend} from '../../util/friends';
import {setMessage} from '../slice/message.slice';
import {t} from '../../languages/i18n';

interface DataParam {
  idToken: string;
}

export const getFriends = createAsyncThunk(
  'getListFriend',
  async (data: DataParam, thunkApi) => {
    try {
      const listFriendId = await getListIdFriend(data.idToken);
      const listFriend = await getListFriend(data.idToken, listFriendId);
      return listFriend;
    } catch (error: any) {
      console.error('Error fetching list friend', error);
      thunkApi.dispatch(
        setMessage({
          message: error.message,
          type: t('error'),
        }),
      );
      return thunkApi.rejectWithValue(error);
    }
  },
);
