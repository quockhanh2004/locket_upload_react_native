/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import {Colors, Icon, Text, TouchableOpacity, View} from 'react-native-ui-lib';
import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Linking, RefreshControl, ScrollView} from 'react-native';
import codePush from 'react-native-code-push';
import {checkUpdateApk} from '../../util/update';

import {
  // enableLocketGold,
  getAccountInfo,
  updateDisplayName,
} from '../../redux/action/user.action';
import EditTextDialog from '../../Dialog/EditTextDialog';
import Header from '../../components/Header';
import UpdatePopup from '../../Dialog/UpdatePopup';
import {
  CODEPUSH_DEPLOYMENTKEY,
  getStatusFromCodePush,
} from '../../util/codepush';
import MainButton from '../../components/MainButton';
import {setMessage} from '../../redux/slice/message.slice';
import UserInfo from '../../components/UserInfo';
import {useRoute} from '@react-navigation/native';
import {nav} from '../../navigation/navName';
import {AppDispatch, RootState} from '../../redux/store';
import ModalImageViewBlur from './ModalImageViewBlur';
import {t} from '../../languages/i18n';
import {UpdateInfoType} from '../../models/update.model';
import {hapticFeedback} from '../../util/haptic';
import {navigationTo} from '../../navigation/HomeNavigation';
import {VERSION_SKIP_CODEPUSH} from '../../util/constrain';

const AccountScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useRoute<any>().params;
  const local_update = params?.local_update;

  const {userInfo, isLoading, user, updateAvatarLoading} = useSelector(
    (state: RootState) => state.user,
  );
  const [isEditName, setisEditName] = useState(false);
  const [visibleBigAvatar, setvisibleBigAvatar] = useState(false);

  const handleRefresh = () => {
    dispatch(
      getAccountInfo({
        idToken: user?.idToken || '',
        refreshToken: user?.refreshToken || '',
      }),
    );
  };

  const handleEditName = () => {
    setisEditName(!isEditName);
  };

  const onDismissEditName = () => {
    setisEditName(false);
  };

  const handleConfirmEditName = (firstName: string, lastName: string) => {
    dispatch(
      updateDisplayName({
        first_name: firstName,
        last_name: lastName,
        idToken: user?.idToken || '',
        refreshToken: user?.refreshToken || '',
      }),
    );
  };

  const handleUpdateAvatar = async () => {
    setvisibleBigAvatar(true);
  };
  useEffect(() => {
    if (local_update) {
      handleCodePushUpdate();
    }
  }, [local_update]);

  const [updateInfo, setUpdateInfo] = useState<UpdateInfoType | null>(null);
  const [updateAPKInfo, setupdateAPKInfo] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [decriptionUpdate, setDecriptionUpdate] = useState('');

  const handleCodePushUpdate = useCallback(async () => {
    setUpdateInfo('CHECKING_FOR_UPDATE');
    setIsPopupVisible(true);

    try {
      const apkUpdate = await checkUpdateApk();
      if (apkUpdate) {
        setupdateAPKInfo(apkUpdate);
        setDecriptionUpdate(apkUpdate?.decriptionUpdate);
        return;
      }
      const update = await codePush.checkForUpdate(CODEPUSH_DEPLOYMENTKEY());

      if (update && update.label === VERSION_SKIP_CODEPUSH) {
        return;
      }

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
  }, []);

  const handleSetting = () => {
    hapticFeedback();
    navigationTo(nav.setting);
  };

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

  const handleCheckUpdateAPK = useCallback(async () => {
    Linking.openURL(updateAPKInfo.downloadUrl);
  }, [updateAPKInfo]);

  const onPostpone = useCallback(() => {
    setIsPopupVisible(false);
    setTimeout(() => {
      setUpdateInfo(null);
    }, 900);
  }, []);

  const handlePressGithub = useCallback(() => {
    hapticFeedback();
    Linking.openURL('https://github.com/quockhanh2004');
  }, []);

  const handlePressFacebook = useCallback(() => {
    hapticFeedback();
    Linking.openURL('https://www.facebook.com/profile.php?id=61575901494417');
  }, []);

  return (
    <>
      <Header rightIcon={'ic_setting'} rightIconAction={handleSetting} />
      <ScrollView
        refreshControl={
          <RefreshControl onRefresh={handleRefresh} refreshing={isLoading} />
        }
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
        }}>
        <View flex-1 bg-black centerV gap-24>
          <UserInfo
            dataUser={userInfo}
            handleEditName={handleEditName}
            handleUpdateAvatar={handleUpdateAvatar}
            updateAvatarLoading={updateAvatarLoading}
          />
          <View paddingH-23>
            <MainButton
              label={t('check_update_app')}
              onPress={handleCodePushUpdate}
            />
          </View>

          <TouchableOpacity onPress={handlePressGithub}>
            <View center row gap-8>
              <Icon
                assetGroup="icons"
                assetName="ic_github"
                tintColor={Colors.grey30}
                size={20}
              />
              <Text grey30>quockhanh2004</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePressFacebook}>
            <View center row gap-8>
              <Icon
                assetGroup="icons"
                assetName="ic_facebook"
                tintColor={Colors.grey30}
                size={20}
              />
              <Text grey30>Locket Upload</Text>
            </View>
          </TouchableOpacity>
        </View>

        <EditTextDialog
          visible={isEditName}
          onDismiss={onDismissEditName}
          label={t('edit_name')}
          onConfirm={handleConfirmEditName}
          isEditName={true}
          placeholder={t('first_name')}
          placeholder2={t('last_name')}
          value={userInfo?.firstName || ''}
          value2={userInfo?.lastName || ''}
          isLoading={isLoading}
        />
        <UpdatePopup
          isVisible={isPopupVisible}
          updateInfo={updateInfo || 'CHECK_UPDATE'}
          progress={downloadProgress}
          onUpdate={onUpdate}
          decriptionUpdate={decriptionUpdate}
          onPostpone={onPostpone}
          onCheckUpdate={handleCodePushUpdate}
          apkUpdateInfo={updateAPKInfo}
          onUpdateApk={handleCheckUpdateAPK}
        />
        <ModalImageViewBlur
          image={userInfo?.photoUrl || ''}
          visible={visibleBigAvatar}
          onCancel={function (): void {
            setvisibleBigAvatar(false);
          }}
        />
      </ScrollView>
    </>
  );
};

export default AccountScreen;
