import {createAsyncThunk} from '@reduxjs/toolkit';
import {setMessage} from '../slice/message.slice';
import axios from 'axios';
import {t} from '../../languages/i18n';
import {generateUUIDv4} from '../../util/chat';
import {loginHeader} from '../../util/constrain';

interface DataParam {
  idToken: string;
  receiver_uid: string;
  client_token: string;
  msg: string;
  moment_uid?: string;
  from_memory?: boolean;
}

export const sendMessage = createAsyncThunk(
  'sendMessage',
  async (data: DataParam, thunkApi) => {
    try {
      const {idToken, receiver_uid, msg, moment_uid} = data;
      const body = {
        data: {
          receiver_uid,
          moment_uid,
          msg,
          client_token: generateUUIDv4(),
          from_memory: true,
        },
      };
      const response = await axios.post(
        'https://api.locketcamera.com/sendChatMessageV2',
        body,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            ...loginHeader,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error?.response?.data) || error.message}`,
          type: t('error'),
        }),
      );
      return thunkApi.rejectWithValue(
        error?.response?.data?.error || error.message,
      );
    }
  },
);
