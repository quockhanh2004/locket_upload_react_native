/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react-hooks/exhaustive-deps */
import {useCallback, useEffect, useState} from 'react';
import codePush from 'react-native-code-push';

import AutoCheckUpdateDialog from '../Dialog/AutoCheckUpdateDialog';
import {UpdateInfoType} from '../models/update.model';
import {checkUpdateApk} from '../util/update';
import {CODEPUSH_DEPLOYMENTKEY, getStatusFromCodePush} from '../util/codepush';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../redux/store';
import {setMessage} from '../redux/slice/message.slice';
import {t} from '../languages/i18n';
import {Linking} from 'react-native';

const AutoCheckUpdate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfoType | null>(null);
  const [updateAPKInfo, setupdateAPKInfo] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [decriptionUpdate, setDecriptionUpdate] = useState('');
  useEffect(() => {
    const checkUpdate = async () => {
      setUpdateInfo('CHECKING_FOR_UPDATE');
      try {
        const apkUpdate = await checkUpdateApk();
        if (apkUpdate) {
          setupdateAPKInfo(apkUpdate);
          setDecriptionUpdate(apkUpdate?.decriptionUpdate);
          return;
        }
        const update = await codePush.checkForUpdate(CODEPUSH_DEPLOYMENTKEY());

        if (!update) {
          setUpdateInfo('UP_TO_DATE');
          setDecriptionUpdate('');
        } else {
          setUpdateInfo('UPDATE_AVAILABLE');
          setDecriptionUpdate(update?.description);
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
  }, []);

  const onUpdate = useCallback(() => {
    setUpdateInfo('DOWNLOADING_PACKAGE');
    codePush.sync(
      {
        updateDialog: undefined,
        installMode: codePush.InstallMode.IMMEDIATE,
        deploymentKey: CODEPUSH_DEPLOYMENTKEY(),
      },
      status => {
        switch (status) {
          case codePush.SyncStatus.UPDATE_INSTALLED:
            setUpdateInfo('UPDATE_INSTALLED');
            setDecriptionUpdate('');
            break;
          case codePush.SyncStatus.UP_TO_DATE:
            setUpdateInfo('UP_TO_DATE');
            setDecriptionUpdate('');
            break;
          case codePush.SyncStatus.UNKNOWN_ERROR:
          case codePush.SyncStatus.UPDATE_IGNORED:
            setUpdateInfo('ERROR');
            setDecriptionUpdate('');
            break;
          default:
            setUpdateInfo(getStatusFromCodePush(status)); // Hàm helper để map status
        }
      },
      progress => {
        setDownloadProgress(progress.receivedBytes / progress.totalBytes);
      },
    );
  }, []);

  const handleUpdateAPK = useCallback(async () => {
    Linking.openURL(updateAPKInfo.downloadUrl);
  }, [updateAPKInfo]);
  return (
    <AutoCheckUpdateDialog
      isVisible={
        updateInfo === 'UPDATE_AVAILABLE' ||
        updateInfo === 'APK_UPDATE_AVAILABLE' ||
        updateInfo === 'DOWNLOADING_PACKAGE' ||
        updateInfo === 'INSTALLING_UPDATE' ||
        updateInfo === 'UPDATE_INSTALLED'
      }
      updateInfo={updateInfo}
      onUpdate={onUpdate}
      onUpdateApk={handleUpdateAPK}
      onCheckUpdate={() => {}}
      onPostpone={() => {
        setUpdateInfo(null);
        setDecriptionUpdate('');
      }}
      progress={downloadProgress}
      apkUpdateInfo={updateAPKInfo}
      decriptionUpdate={decriptionUpdate}
    />
  );
};

export default AutoCheckUpdate;
