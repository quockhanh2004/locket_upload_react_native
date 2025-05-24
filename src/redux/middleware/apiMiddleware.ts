import {instanceMyServer} from '../../util/axios_instance';
import {version} from '../../../package.json';
import {User} from '../../models/user.model';
import {SettingState} from '../../models/setting.model';
const apiMiddleware =
  ({getState}: any) =>
  (next: (arg0: any) => void) =>
  (action: any) => {
    //lấy version và activeKey từ slice setting
    const state = getState();
    const user: User = state.user.user;
    const setting: SettingState = state.setting;
    const appVersion = version;

    // console.log(setting.activeKey, user);

    if (setting?.activeKey && user?.email) {
      const activeKey = setting.activeKey[user?.email]?.key;
      instanceMyServer.defaults.headers.common['active-key'] = activeKey;
    }

    if (appVersion) {
      instanceMyServer.defaults.headers.common['app-version'] = appVersion;
    }

    next(action);
  };

export default apiMiddleware;
