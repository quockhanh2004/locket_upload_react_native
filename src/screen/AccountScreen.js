/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  Avatar,
  Colors,
  TouchableOpacity,
  Icon,
  LoaderScreen,
  Switch,
} from 'react-native-ui-lib';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {converTime} from '../util/convertTime';
import {Dimensions, RefreshControl, ScrollView} from 'react-native';

import {
  enableLocketGold,
  getAccountInfo,
  updateDisplayName,
} from '../redux/action/user.action';
import EditTextDialog from '../Dialog/EditTextDialog';
import {splitName} from '../util/splitName';
import {clearStatus} from '../redux/slice/user.slice';
import Header from '../component/Header';

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
  // console.log(JSON.stringify(userInfo));

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

  const handleEnableGold = val => {
    dispatch(
      enableLocketGold({
        idToken: user?.idToken,
        refreshToken: user?.refreshToken,
        enable: val,
      }),
    );
  };
  return (
    <ScrollView
      refreshControl={
        <RefreshControl onRefresh={handleRefresh} refreshing={isLoading} />
      }>
      <View height={Dimensions.get('window').height} bg-black centerV>
        {dataUser ? (
          <View center>
            {!updateAvatarLoading ? (
              <Avatar
                source={{uri: dataUser?.photoUrl}}
                size={100}
                onPress={handleUpdateAvatar}
                animate
              />
            ) : (
              <View>
                <LoaderScreen color={Colors.white} size={'medium'} />
              </View>
            )}
            <View row centerV marginT-20>
              <Text text50BL color={Colors.white}>
                {dataUser?.displayName}
              </Text>
              <View absR style={{right: -24}}>
                <TouchableOpacity onPress={handleEditName}>
                  <Icon
                    assetGroup="icons"
                    assetName="ic_edit"
                    size={18}
                    tintColor={Colors.grey40}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text text60BL color={Colors.white} marginT-20>
              {dataUser?.email}
            </Text>
            <Text text70BL color={Colors.white} marginT-10>
              Tham gia vào Locket {converTime(dataUser?.createdAt)}
            </Text>

            <View row gap-12 marginT-20>
              <Text text70BL white>
                Locket Gold icon
              </Text>
              <Switch
                onColor={Colors.primary}
                onValueChange={handleEnableGold}
                disabled={isLoading}
              />
            </View>
          </View>
        ) : (
          <View center>
            <Text text70BL color={Colors.white} marginT-20>
              {
                'Không tìm thấy thông tin tài khoản \nhãy thử vuốt xuống để làm mới nhé!'
              }
            </Text>
          </View>
        )}
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
    </ScrollView>
  );
};

export default AccountScreen;
