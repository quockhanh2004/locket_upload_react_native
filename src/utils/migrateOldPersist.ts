// Migration (chạy 1 lần ở đầu app)
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppDispatch} from '../redux/store';
import {setUser} from '../redux/slice/user.slice';
import {setSetting} from '../redux/slice/setting.slice';
import {restoreFriends} from '../redux/slice/friends.slice';
import {SettingState} from '../models/setting.model';

export const restoreOldData = async (dispatch: AppDispatch) => {
  const oldDataRoot = await AsyncStorage.getItem('persist:root');
  if (oldDataRoot) {
    const parsed = JSON.parse(oldDataRoot);
    if (parsed.user) {
      dispatch(setUser(parsed.user));
    }

    if (parsed.setting) {
      dispatch(setSetting(parsed.setting));
    }

    if (parsed.friends) {
      dispatch(restoreFriends(parsed.friends));
    }

    await AsyncStorage.removeItem('persist:root');
  }

  const oldPosts = await AsyncStorage.getItem('persist:oldPosts');
  if (oldPosts) {
    await AsyncStorage.removeItem('persist:oldPosts');
  }
};

export const getTrySoftwareEncode = async () => {
  const setting = await AsyncStorage.getItem('persist:setting');
  if (setting) {
    const parsed: SettingState = JSON.parse(setting);
    return parsed.trySoftwareEncode.toString() === 'true';
  } else {
    return false;
  }
};
