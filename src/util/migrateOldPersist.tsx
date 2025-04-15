// Migration (chạy 1 lần ở đầu app)
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppDispatch} from '../redux/store';
import {setUser} from '../redux/slice/user.slice';
import {setSetting, SettingState} from '../redux/slice/setting.slice';
import {restoreFriends} from '../redux/slice/friends.slice';

export const restoreOldData = async (dispatch: AppDispatch) => {
  const oldData = await AsyncStorage.getItem('persist:root');
  if (oldData) {
    const parsed = JSON.parse(oldData);
    if (parsed.user) {
      dispatch(setUser(parsed.user));
    }

    if (parsed.setting) {
      dispatch(setSetting(parsed.setting));
    }

    if (parsed.friends) {
      dispatch(restoreFriends(parsed.friends));
    }

    // Xóa oldData sau khi đã khôi phục
    await AsyncStorage.removeItem('persist:root');
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
