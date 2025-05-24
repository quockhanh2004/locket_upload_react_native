import {createAsyncThunk} from '@reduxjs/toolkit';
import {instanceMyServer} from '../../util/axios_instance';
import {setMessage} from '../slice/message.slice';

interface DataParam {
  key: string;
  email: string;
}

export const activeKey = createAsyncThunk(
  'activeKey',
  async (data: DataParam, thunkApi) => {
    try {
      const response = await instanceMyServer.post('/users/activate-key', data);
      const result = response.data;
      return result;
    } catch (error: any) {
      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error?.response?.data) || error.message}`,
          type: 'error',
        }),
      );
      return thunkApi.rejectWithValue(error.message);
    }
  },
);

export const getActiveKey = createAsyncThunk(
  'getActiveKey',
  async (email: string, thunkApi) => {
    try {
      const response = await instanceMyServer.get(
        `/users/client-gen-key/${email}`,
      );
      console.log(response.data);

      return response.data;
    } catch (error: any) {
      console.log(error.response?.data);

      thunkApi.dispatch(
        setMessage({
          message: `${JSON.stringify(error?.response?.data) || error.message}`,
          type: 'error',
        }),
      );
      return thunkApi.rejectWithValue(error.message);
    }
  },
);
