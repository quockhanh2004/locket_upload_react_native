import axios from 'axios';
import {version} from '../../package.json';

export const checkUpdateApk = async () => {
  const response = await axios.get(
    'https://api.github.com/repos/quockhanh2004/locket_upload_react_native/releases/latest',
  );
  const latestVersion = response.data.tag_name;
  const latestVersionNumber = latestVersion.replace('v', '');
  if (compareVersions(latestVersionNumber, version) > 0) {
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

function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  const maxLength = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < maxLength; i++) {
    const aVal = aParts[i] ?? 0;
    const bVal = bParts[i] ?? 0;
    if (aVal < bVal) {
      return -1;
    }
    if (aVal > bVal) {
      return 1;
    }
  }

  return 0; // Bằng nhau
}
