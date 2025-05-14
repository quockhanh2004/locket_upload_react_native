import {createAsyncThunk} from '@reduxjs/toolkit';
import {setMessage} from '../slice/message.slice';
import axios from 'axios';
import {t} from '../../languages/i18n';
import {generateUUIDv4} from '../../util/chat';
import {loginHeader, MY_SERVER_URL} from '../../util/constrain';

interface DataParam {
  idToken: string;
  receiver_uid?: string | null;
  msg: string;
  moment_uid?: string | null;
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

export const getMessage = createAsyncThunk(
  'getMessage',
  async (token: string, thunkApi) => {
    try {
      const body = {
        token,
      };
      const response = await axios.post(`${MY_SERVER_URL}/message`, body);
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

interface GetMessageWithParam {
  token: string;
  conversation_uid: string;
  timestamp?: string;
}

export const getMessageWith = createAsyncThunk(
  'getMessageWith',
  async (data: GetMessageWithParam, thunkApi) => {
    try {
      const body = {
        token: data.token,
        timestamp: data?.timestamp,
      };
      const response = await axios.post(
        `${MY_SERVER_URL}/message/${data.conversation_uid}`,
        body,
      );
      return {
        uid: data.conversation_uid,
        chat: response.data?.message,
        isLoadMore: data.timestamp ? true : false,
      };
    } catch (error: any) {
      console.log(error.response.data);

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

export const markReadMessage = createAsyncThunk(
  'markReadMessage',
  async (data: {idToken: string; conversation_uid: string}, thunkApi) => {
    try {
      const {idToken, conversation_uid} = data;
      const body = {
        data: {
          conversation_uid,
        },
      };
      const response = await axios.post(
        'https://api.locketcamera.com/markAsRead',
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
