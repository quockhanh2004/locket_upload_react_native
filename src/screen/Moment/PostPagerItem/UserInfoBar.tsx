/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, Avatar} from 'react-native-ui-lib';
import {Friend} from '../../../models/friend.model';
import {timeDiffFromNow} from '../../../util/convertTime';

interface UserInfoBarProps {
  user?: Friend | null;
  date: number;
}

const UserInfoBar: React.FC<UserInfoBarProps> = ({user, date}) => {
  if (!user) {
    return null;
  }

  return (
    <View row center>
      {user.profile_picture_url ? (
        <Avatar source={{uri: user.profile_picture_url}} size={32} />
      ) : (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#555',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text text80BL white>
            {user.first_name?.at(0)}
            {user.last_name?.at(0)}
          </Text>
        </View>
      )}
      <Text marginL-8 white text60BL>
        {user.first_name}
      </Text>
      <Text marginL-8 grey40 text70BL>
        {timeDiffFromNow(date)}
      </Text>
    </View>
  );
};

export default React.memo(UserInfoBar);
