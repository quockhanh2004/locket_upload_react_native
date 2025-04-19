/* eslint-disable react-native/no-inline-styles */
// components/HomeHeader.tsx
import React from 'react';
import {
  View,
  Avatar,
  TouchableOpacity,
  Icon,
  Colors,
} from 'react-native-ui-lib';
import {ProviderUserInfo} from '../../models/user.model';

interface Props {
  userInfo: ProviderUserInfo;
  onLogout: () => void;
  onViewProfile: () => void;
}

const HomeHeader: React.FC<Props> = ({userInfo, onLogout, onViewProfile}) => (
  <View row spread centerV>
    <Avatar
      source={{uri: userInfo?.photoUrl}}
      size={36}
      onPress={onViewProfile}
    />
    <TouchableOpacity onPress={onLogout}>
      <View
        padding-8
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Colors.grey40,
        }}>
        <Icon
          assetGroup="icons"
          assetName="ic_logout"
          size={24}
          tintColor={Colors.grey40}
        />
      </View>
    </TouchableOpacity>
  </View>
);

export default HomeHeader;
