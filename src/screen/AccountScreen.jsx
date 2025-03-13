/* eslint-disable react-hooks/exhaustive-deps */
import {Colors, Icon, Text, TouchableOpacity, View} from 'react-native-ui-lib';
import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dimensions, Linking, RefreshControl, ScrollView} from 'react-native';
import codePush from 'react-native-code-push';

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

const AccountScreen = () => {
  const dispatch = useDispatch();
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

  // const handleEnableGold = val => {
  //   dispatch(
  //     enableLocketGold({
  //       idToken: user?.idToken,
  //       refreshToken: user?.refreshToken,
  //       enable: val,
  //     }),
  //   );
  // };

  // State cập nhật CodePush

  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleCodePushUpdate = useCallback(async () => {
    setUpdateInfo('CHECKING_FOR_UPDATE');
    setIsPopupVisible(true);

    try {
      const update = await codePush.checkForUpdate(CODEPUSH_DEPLOYMENTKEY());
      if (!update) {
        setUpdateInfo('UP_TO_DATE');
      } else {
        setUpdateInfo('UPDATE_AVAILABLE');
      }
    } catch (error) {
      dispatch(
        setMessage({
          message: JSON.stringify(error),
          type: 'Error',
        }),
      );
      setUpdateInfo('ERROR');
    }
  }, []);

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
            break;
          case codePush.SyncStatus.UP_TO_DATE:
            setUpdateInfo('UP_TO_DATE');
            break;
          case codePush.SyncStatus.UNKNOWN_ERROR:
          case codePush.SyncStatus.UPDATE_IGNORED:
            setUpdateInfo('ERROR');
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
      <Header />
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
        onPostpone={onPostpone}
        onCheckUpdate={handleCodePushUpdate}
      />
    </ScrollView>
  );
};

export default AccountScreen;
