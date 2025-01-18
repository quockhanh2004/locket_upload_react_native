import {View, Text, Avatar, Colors} from 'react-native-ui-lib';
import React from 'react';
import {useSelector} from 'react-redux';
import {converTime} from '../util/convertTime';

const AccountScreen = () => {
  const {userInfo} = useSelector(state => state.user);

  const dataUser = userInfo?.users[0];
  return (
    <View flex bg-black center>
      <View center>
        <Avatar source={{uri: dataUser?.photoUrl}} size={100} />
        <Text text50BL color={Colors.white} marginT-20>
          {dataUser?.displayName}
        </Text>
        <Text text60BL color={Colors.white} marginT-20>
          {dataUser?.email}
        </Text>
        <Text text70BL color={Colors.white} marginT-10>
          Tham gia vào Locket {converTime(dataUser?.createdAt)}
        </Text>
      </View>
    </View>
  );
};

export default AccountScreen;
