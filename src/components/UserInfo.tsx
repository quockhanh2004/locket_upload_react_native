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

interface UserInfoProps {
  dataUser: any;
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
        <Avatar
          source={{uri: dataUser?.photoUrl}}
          size={100}
          onPress={handleUpdateAvatar}
          animate
        />
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
        {t('invate_to_locket')} {converTime(dataUser?.createdAt)}
      </Text>
    </View>
  );
};

export default UserInfo;
