/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  Avatar,
  Colors,
  TouchableOpacity,
  Icon,
} from 'react-native-ui-lib';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {converTime} from '../util/convertTime';
import {Dimensions, RefreshControl, ScrollView} from 'react-native';
import {getAccountInfo, updateDisplayName} from '../redux/action/user.action';
import {useNavigation} from '@react-navigation/native';
import EditTextDialog from '../Dialog/EditTextDialog';

const AccountScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {userInfo, isLoading, user} = useSelector(state => state.user);
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
    }

    if (name.length % 2 === 0) {
      let first_name = '';
      for (let i = 0; i <= name.length / 2 - 1; i++) {
        first_name += name[i] + ' ';
      }
      // console.log('here');

      setlocalFirstName(first_name.trim());

      let last_name = '';
      for (let i = name.length / 2; i <= name.length - 1; i++) {
        last_name += name[i] + ' ';
      }
      setlocalLastName(last_name.trim());
      setlocalFirstName(first_name.trim());
    } else {
      let first_name = '';
      for (let i = 0; i < (name.length / 2).toFixed(0) - 1; i++) {
        first_name += name[i] + ' ';
      }
      setlocalFirstName(first_name.trim());

      let last_name = '';
      for (
        let i = (name.length / 2).toFixed(0) - 1;
        i <= name.length - 1;
        i++
      ) {
        last_name += name[i] + ' ';
      }

      setlocalLastName(last_name.trim());
    }
  }, [name]);

  // useEffect(() => {
  //   console.log(localFirstName);
  // }, [localFirstName]);

  const [isEditName, setisEditName] = useState(false);

  const handleRefresh = () => {
    dispatch(
      getAccountInfo({
        idToken: user?.idToken,
        refreshToken: user?.refreshToken,
      }),
    );
  };

  const handleBack = () => {
    navigation.goBack();
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
  return (
    <ScrollView
      refreshControl={
        <RefreshControl onRefresh={handleRefresh} refreshing={isLoading} />
      }>
      <View height={Dimensions.get('window').height} bg-black centerV>
        {dataUser ? (
          <View center>
            <Avatar source={{uri: dataUser?.photoUrl}} size={100} />
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
      <View bg-black absT paddingH-20 paddingT-20>
        <TouchableOpacity onPress={handleBack}>
          <Icon
            assetGroup="icons"
            assetName="ic_back"
            tintColor={Colors.grey40}
            size={24}
          />
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
    </ScrollView>
  );
};

export default AccountScreen;
