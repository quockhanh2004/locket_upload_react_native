/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  Avatar,
  Colors,
  TouchableOpacity,
  Icon,
  LoaderScreen,
} from 'react-native-ui-lib';
import {converTime} from '../util/convertTime';
import {t} from '../languages/i18n';
import {User} from '../models/user.model';

interface UserInfoProps {
  dataUser: User | null | undefined;
  updateAvatarLoading: boolean;
  handleUpdateAvatar: () => void;
  handleEditName: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({
  dataUser,
  updateAvatarLoading,
  handleUpdateAvatar,
  handleEditName,
}) => {
  if (!dataUser) {
    return (
      <View center>
        <Text text70BL color={Colors.white} marginT-20>
          {t('not_found_info_account')}
        </Text>
      </View>
    );
  }

  return (
    <View center>
      {!updateAvatarLoading ? (
        dataUser?.photoUrl ? (
          <Avatar
            source={{uri: dataUser?.photoUrl}}
            size={100}
            onPress={handleUpdateAvatar}
            animate
          />
        ) : (
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: Colors.grey40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text text30BL white>{`${dataUser?.firstName?.at(
              0,
            )}${dataUser.lastName?.at(0)}`}</Text>
          </View>
        )
      ) : (
        <LoaderScreen color={Colors.white} size={'large'} />
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
        {t('invate_to_locket')} {converTime(dataUser?.createdAt || '0')}
      </Text>
    </View>
  );
};

export default UserInfo;
