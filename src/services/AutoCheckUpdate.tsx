/* eslint-disable react/react-in-jsx-scope */
import {useEffect, useState, useCallback} from 'react';
import {Linking} from 'react-native';
import codePush from 'react-native-code-push';
import {useDispatch} from 'react-redux';

import AutoCheckUpdateDialog from '../Dialog/AutoCheckUpdateDialog';
import {checkUpdateApk} from '../util/update';
import {CODEPUSH_DEPLOYMENTKEY, getStatusFromCodePush} from '../util/codepush';
import {setMessage} from '../redux/slice/message.slice';
import {AppDispatch} from '../redux/store';
import {t} from '../languages/i18n';
import {UpdateInfoType} from '../models/update.model';
import {VERSION_SKIP_CODEPUSH} from '../util/constrain';

const AutoCheckUpdate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [updateInfo, setUpdateInfo] = useState<UpdateInfoType | null>(null);
  const [apkUpdateInfo, setApkUpdateInfo] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const checkUpdate = async () => {
      setUpdateInfo('CHECKING_FOR_UPDATE');
      try {
        const apkUpdate = await checkUpdateApk();
        if (apkUpdate) {
          setUpdateInfo('UPDATE_AVAILABLE');
          setApkUpdateInfo(apkUpdate);
          setDescription(apkUpdate?.decriptionUpdate);
          return;
        }

        const update = await codePush.checkForUpdate(CODEPUSH_DEPLOYMENTKEY());
        if (update && update.label === VERSION_SKIP_CODEPUSH) {
          return;
        }
        if (update) {
          setUpdateInfo('UPDATE_AVAILABLE');
          setDescription(update.description || '');
        }
      } catch (error) {
        console.log(error);
        dispatch(
          setMessage({
            message: JSON.stringify(error),
            type: t('error'),
          }),
        );
        setUpdateInfo('ERROR');
      }
    };
    checkUpdate();
  }, [dispatch]);

  const onUpdate = useCallback(() => {
    setUpdateInfo('DOWNLOADING_PACKAGE');
    codePush.sync(
      {
        installMode: codePush.InstallMode.IMMEDIATE,
        deploymentKey: CODEPUSH_DEPLOYMENTKEY(),
      },
      status => {
        switch (status) {
          case codePush.SyncStatus.UPDATE_INSTALLED:
          case codePush.SyncStatus.UP_TO_DATE:
          case codePush.SyncStatus.UNKNOWN_ERROR:
          case codePush.SyncStatus.UPDATE_IGNORED:
            setUpdateInfo(getStatusFromCodePush(status));
            setDescription('');
            break;
          default:
            setUpdateInfo(getStatusFromCodePush(status));
        }
      },
      progress => {
        setDownloadProgress(progress.receivedBytes / progress.totalBytes);
      },
    );
  }, []);

  const handleUpdateAPK = () => {
    if (apkUpdateInfo?.downloadUrl) {
      Linking.openURL(apkUpdateInfo.downloadUrl);
    }
  };

  const shouldShowDialog =
    updateInfo === 'UPDATE_AVAILABLE' ||
    updateInfo === 'APK_UPDATE_AVAILABLE' ||
    updateInfo === 'DOWNLOADING_PACKAGE' ||
    updateInfo === 'INSTALLING_UPDATE' ||
    updateInfo === 'UPDATE_INSTALLED';

  return (
    <AutoCheckUpdateDialog
      isVisible={shouldShowDialog}
      updateInfo={updateInfo}
      onUpdate={onUpdate}
      onUpdateApk={handleUpdateAPK}
      onPostpone={() => {
        setUpdateInfo(null);
        setDescription('');
      }}
      progress={downloadProgress}
      apkUpdateInfo={apkUpdateInfo}
      decriptionUpdate={description}
      onCheckUpdate={() => {}}
    />
  );
};

export default AutoCheckUpdate;
