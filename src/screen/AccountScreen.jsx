/* eslint-disable react-hooks/exhaustive-deps */
import {Colors, Icon, Text, TouchableOpacity, View} from 'react-native-ui-lib';
import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  Dimensions,
  Platform,
  Linking,
  RefreshControl,
  ScrollView,
  Alert,
  PermissionsAndroid,
  NativeModules,
} from 'react-native';
import codePush from 'react-native-code-push';
import {checkUpdateApk} from '../util/update';
import RNFetchBlob from 'rn-fetch-blob';

import {
  // enableLocketGold,
  getAccountInfo,
  updateDisplayName,
} from '../redux/action/user.action';
import EditTextDialog from '../Dialog/EditTextDialog';
import {splitName} from '../util/splitName';
import {clearStatus} from '../redux/slice/user.slice';
import Header from '../components/Header';
import UpdatePopup from '../Dialog/UpdatePopup';
import {CODEPUSH_DEPLOYMENTKEY, getStatusFromCodePush} from '../util/codepush';
import MainButton from '../components/MainButton';
import {setMessage} from '../redux/slice/message.slice';
import UserInfo from '../components/UserInfo';
import {useRoute} from '@react-navigation/native';
import {navigationTo} from './HomeScreen';
import {nav} from '../navigation/navName';

const AccountScreen = () => {
  const dispatch = useDispatch();
  const params = useRoute().params;
  const local_update = params?.local_update;

  const {userInfo, isLoading, user, updateAvatarLoading} = useSelector(
    state => state.user,
  );
  const [dataUser, setdataUser] = useState(userInfo?.users[0]);

  const [localFirstName, setlocalFirstName] = useState('');
  const [localLastName, setlocalLastName] = useState('');
  const [name, setName] = useState([]);

  useEffect(() => {
    if (userInfo?.users?.length > 0) {
      setdataUser(userInfo?.users[0]);
      setName(userInfo?.users[0]?.displayName?.split(' '));
    }
  }, [userInfo]);

  useEffect(() => {
    if (name.length === 0) {
      return;
    } else {
      // console.log(name.length / 2);
      dispatch(clearStatus());
    }

    const {first_name, last_name} = splitName(name);

    setlocalFirstName(first_name);
    setlocalLastName(last_name);
  }, [name]);

  const [isEditName, setisEditName] = useState(false);

  const handleRefresh = () => {
    dispatch(
      getAccountInfo({
        idToken: user?.idToken,
        refreshToken: user?.refreshToken,
      }),
    );
  };

  const handleEditName = () => {
    setisEditName(!isEditName);
  };

  const onDismissEditName = () => {
    setisEditName(false);
  };

  const handleConfirmEditName = (firstName, lastName) => {
    dispatch(
      updateDisplayName({
        first_name: firstName,
        last_name: lastName,
        idToken: user?.idToken,
        refreshToken: user?.refreshToken,
      }),
    );
  };

  const handleUpdateAvatar = async () => {
    // const result = await selectMedia();
    // let avatar;
    // if (result?.length > 0) {
    //   avatar = result[0];
    // }
    // if (!avatar) {
    //   return;
    // }
    // dispatch(
    //   updateAvatar({
    //     imageInfo: avatar,
    //     idUser: user?.localId,
    //     idToken: user?.idToken,
    //     refreshToken: user?.refreshToken,
    //   }),
    // );
  };
  useEffect(() => {
    if (local_update) {
      handleCodePushUpdate();
    }
  }, [local_update]);

  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateAPKInfo, setupdateAPKInfo] = useState(null);
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
          type: 'Error',
        }),
      );
      setUpdateInfo('ERROR');
    }
  }, []);

  const handleSetting = () => {
    navigationTo(nav.setting);
  };

  const onUpdate = useCallback(() => {
    setUpdateInfo('DOWNLOADING_PACKAGE');
    codePush.sync(
      {
        updateDialog: false,
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
    console.log(updateAPKInfo);

    if (Platform.OS === 'android') {
      // Check for storage permission
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message:
              'Locket needs access to your storage to download the update',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Storage permission is required to download updates',
          );
          return;
        }
      } catch (err) {
        console.error('Permission request error:', err);
        return;
      }
    }

    const downloadUrl = updateAPKInfo?.downloadUrl;
    const {dirs} = RNFetchBlob.fs;
    const apkPath = `${dirs.DownloadDir}/locket_${updateAPKInfo.latestVersion}.apk`;

    //xin cấp quyền cài đặt apk
    try {
      const {InstallPermission} = NativeModules;

      InstallPermission.hasInstallPermission(granted => {
        if (granted) {
          console.log('Quyền đã được cấp');
        } else {
          console.log('Chưa có quyền, cần hướng dẫn cấp quyền');
        }
      });
    } catch (err) {
      console.error('Permission request error:', err);
      return;
    }

    // Kiểm tra xem tệp APK đã tồn tại chưa
    const fileExists = await RNFetchBlob.fs.exists(apkPath);
    if (fileExists) {
      RNFetchBlob.android.actionViewIntent(
        apkPath,
        'application/vnd.android.package-archive',
      );
      return;
    }

    setUpdateInfo('DOWNLOADING_PACKAGE');

    RNFetchBlob.config({
      fileCache: true,
      // Sử dụng thư mục ứng dụng thay vì DownloadDir
      path: `${RNFetchBlob.fs.dirs.DocumentDir}/locket_update.apk`,
      addAndroidDownloads: {
        useDownloadManager: true,
        title: 'Locket Update',
        description: 'Downloading new version...',
        mime: 'application/vnd.android.package-archive',
        mediaScannable: true,
        notification: true,
        // Thêm điều này để cải thiện khả năng tương thích
        path: apkPath,
      },
    })
      .fetch('GET', downloadUrl)
      .progress((received, total) => {
        setDownloadProgress(received / total);
      })
      .then(res => {
        setUpdateInfo('UPDATE_INSTALLED');
        if (Platform.OS === 'android') {
          RNFetchBlob.android.actionViewIntent(
            apkPath,
            'application/vnd.android.package-archive',
          );
        }
      })
      .catch(error => {
        console.error('APK download failed:', error);
        setUpdateInfo('ERROR');
      });
  }, [updateAPKInfo]);

  const onPostpone = useCallback(() => {
    setIsPopupVisible(false);
    setTimeout(() => {
      setUpdateInfo(null);
    }, 900);
  }, []);

  const handlePressGithub = useCallback(() => {
    Linking.openURL(
      'https://github.com/quockhanh2004/locket_upload_react_native',
    );
  }, []);

  return (
    <>
      <Header rightIcon={'ic_setting'} rightIconAction={handleSetting} />
      <ScrollView
        refreshControl={
          <RefreshControl onRefresh={handleRefresh} refreshing={isLoading} />
        }>
        <View height={Dimensions.get('window').height} bg-black centerV gap-24>
          <UserInfo
            dataUser={dataUser}
            handleEditName={handleEditName}
            handleUpdateAvatar={handleUpdateAvatar}
            updateAvatarLoading={updateAvatarLoading}
          />
          <View paddingH-23>
            <MainButton
              label={'Kiểm tra cập nhật ứng dụng'}
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
        </View>
        <EditTextDialog
          visible={isEditName}
          onDismiss={onDismissEditName}
          label={'Update Name'}
          onConfirm={handleConfirmEditName}
          isEditName={true}
          placeholder={'First Name'}
          placeholder2={'Last Name'}
          value={localFirstName}
          value2={localLastName}
          isLoading={isLoading}
        />
        <UpdatePopup
          isVisible={isPopupVisible}
          updateInfo={updateInfo}
          progress={downloadProgress}
          onUpdate={onUpdate}
          decriptionUpdate={decriptionUpdate}
          onPostpone={onPostpone}
          onCheckUpdate={handleCodePushUpdate}
          apkUpdateInfo={updateAPKInfo}
          onUpdateApk={handleCheckUpdateAPK}
        />
      </ScrollView>
    </>
  );
};

export default AccountScreen;
