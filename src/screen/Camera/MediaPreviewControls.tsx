/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, TouchableOpacity, Icon, Card, Colors} from 'react-native-ui-lib';

interface MediaPreviewControlsProps {
  onClearMedia: () => void;
  onReturnMedia: () => void;
  onSaveMedia: () => void;
}

const MediaPreviewControls: React.FC<MediaPreviewControlsProps> = ({
  onClearMedia,
  onReturnMedia,
  onSaveMedia,
}) => {
  return (
    <View
      centerV
      width={'100%'}
      row
      paddingV-s4
      style={{justifyContent: 'space-around'}}
      backgroundColor={Colors.transparent}>
      {/* Nút Hủy */}
      <TouchableOpacity
        onPress={onClearMedia}
        hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
        <Icon
          assetGroup="icons"
          assetName="ic_cancel"
          size={30}
          tintColor={Colors.red30}
        />
      </TouchableOpacity>

      {/* Nút Xác nhận/Gửi */}
      <TouchableOpacity
        onPress={onReturnMedia}
        hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            borderWidth: 3,
            borderColor: Colors.primary,
            backgroundColor: Colors.grey10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon
            assetGroup="icons"
            assetName="ic_check"
            size={35}
            tintColor={Colors.primary}
          />
        </View>
      </TouchableOpacity>

      {/* Nút Lưu */}
      <TouchableOpacity
        onPress={onSaveMedia}
        hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
        <Card backgroundColor={Colors.grey20} padding-s2 br100 center>
          <Icon
            assetGroup="icons"
            assetName="ic_save"
            size={30}
            tintColor={Colors.grey60}
          />
        </Card>
      </TouchableOpacity>
    </View>
  );
};

export default MediaPreviewControls;
