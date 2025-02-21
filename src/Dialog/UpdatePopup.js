/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {ActivityIndicator} from 'react-native';
import {View, Dialog, Typography, Colors} from 'react-native-ui-lib';
import CustomDialog from './CustomDialog';
import MainButton from '../components/MainButton';

const UpdatePopup = ({
  isVisible,
  updateInfo,
  progress,
  onUpdate,
  onCheckUpdate,
  onPostpone,
}) => {
  let message = '';
  let showProgress = false;
  let buttons = null;
  const progressPercent = progress ? Math.floor(progress * 100) : 0;

  switch (updateInfo) {
    case 'CHECKING_FOR_UPDATE':
      message = 'Đang kiểm tra cập nhật...';
      break;
    case 'UPDATE_AVAILABLE':
      message = 'Có bản cập nhật mới!';
      buttons = <MainButton label={'Cập nhật'} onPress={onUpdate} />;
      break;
    case 'DOWNLOADING_PACKAGE':
      message = `${'Đang tải xuống bản cập nhật:'} ${progressPercent}%`;
      showProgress = true;
      break;
    case 'INSTALLING_UPDATE':
      message = 'Đang cài đặt bản cập nhật...';
      showProgress = true;
      break;
    case 'UPDATE_INSTALLED':
      message = 'Cập nhật thành công! Ứng dụng sẽ khởi động lại.';
      break;
    case 'UP_TO_DATE':
      message = 'Bạn đã cập nhật phiên bản mới nhất';
      buttons = <MainButton label={'Đóng'} onPress={onPostpone} />;
      break;
    case 'ERROR':
      message = 'Lỗi khi kiểm tra cập nhật.';
      buttons = <MainButton label={'Đóng'} onPress={onPostpone} />;
      break;
    default:
      buttons = <MainButton label={'Kiểm tra'} onPress={onCheckUpdate} />;
      break;
  }

  return (
    <CustomDialog
      visible={isVisible}
      panDirection={Dialog.directions.DOWN}
      onDismiss={onPostpone}
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
        textAlign: 'center',
        width: '100%',
      }}
      bottom
      width={'98%'}
      maxHeight={'100%'}
      containerStyle={{
        backgroundColor: 'black',
        borderWidth: 1,
        borderBottomWidth: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
        borderColor: Colors.grey20,
        gap: 4,
        padding: 12,
        borderRadius: 10,
        paddingBottom: 24,
      }}
      title={message}>
      <View bg-black padding-20>
        <View center gap-12>
          {showProgress && (
            <ActivityIndicator
              size="large"
              color="#007BFF"
              style={{marginTop: 10, marginBottom: 15}}
            />
          )}
          {buttons && <View center>{buttons}</View>}
        </View>
      </View>
    </CustomDialog>
  );
};

export default UpdatePopup;
