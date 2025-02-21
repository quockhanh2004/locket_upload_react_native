import {Platform} from 'react-native';
import codePush from 'react-native-code-push';

export const CODEPUSH_DEPLOYMENTKEY = () => {
  if (Platform.OS === 'android') {
    return 'X_gWZ6w023OX_s32KItOkndwovTe_OvbpfyYgk';
  } else {
    return '';
  }
};

export const getStatusFromCodePush = status => {
  switch (status) {
    case codePush.SyncStatus.CHECKING_FOR_UPDATE:
      return 'CHECKING_FOR_UPDATE';
    case codePush.SyncStatus.DOWNLOADING_PACKAGE:
      return 'DOWNLOADING_PACKAGE';
    case codePush.SyncStatus.INSTALLING_UPDATE:
      return 'INSTALLING_UPDATE';
    case codePush.SyncStatus.UP_TO_DATE:
      return 'UP_TO_DATE';
    case codePush.SyncStatus.UPDATE_INSTALLED:
      return 'UPDATE_INSTALLED';
    case codePush.SyncStatus.UPDATE_IGNORED:
    case codePush.SyncStatus.UNKNOWN_ERROR:
      return 'ERROR'; // Tổng hợp các trạng thái lỗi
    default:
      return null; // Trạng thái không xác định
  }
};
