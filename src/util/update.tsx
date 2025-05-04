import axios from 'axios';
import {version} from '../../package.json';

export const checkUpdateApk = async () => {
  const response = await axios.get(
    'https://api.github.com/repos/quockhanh2004/locket_upload_react_native/releases/latest',
  );
  const latestVersion = response.data.tag_name;
  const latestVersionNumber = latestVersion.replace('v', '');
  if (version !== latestVersionNumber) {
    return {
      latestVersion: latestVersionNumber,
      downloadUrl: response.data.html_url,
      updateInfo: 'APK_UPDATE_AVAILABLE',
      decriptionUpdate: response.data.body,
    };
  } else {
    return null;
  }
};
