/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo, useState} from 'react';
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
  const [updateMessage, setUpdateMessage] = useState(''); // State cho message
  const [updateButtons, setUpdateButtons] = useState(null); // State cho buttons

  let showProgress = false;
  const progressPercent = progress ? Math.floor(progress * 100) : 0;

  const updateInfoCase = useMemo(
    // Sử dụng useMemo để memoize object
    () => ({
      CHECKING_FOR_UPDATE: () => ({
        message: 'Đang kiểm tra cập nhật...',
        buttons: null, // Không có button trong trạng thái này
      }),
      UPDATE_AVAILABLE: () => ({
        message: 'Có bản cập nhật mới!',
        buttons: <MainButton label={'Cập nhật'} onPress={onUpdate} />,
      }),
      DOWNLOADING_PACKAGE: () => ({
        message: `${'Đang tải xuống bản cập nhật:'} ${progressPercent}%`,
        buttons: null, // Không có button trong trạng thái này
      }),
      INSTALLING_UPDATE: () => ({
        message: 'Đang cài đặt bản cập nhật...',
        buttons: null, // Không có button trong trạng thái này
      }),
      UP_TO_DATE: () => ({
        message: 'Bạn đã cập nhật phiên bản mới nhất',
        buttons: <MainButton label={'Đóng'} onPress={onPostpone} />,
      }),
      UPDATE_INSTALLED: () => ({
        message: 'Cập nhật thành công! Ứng dụng sẽ khởi động lại.',
        buttons: <MainButton label={'Đóng'} onPress={onPostpone} />,
      }),
      ERROR: () => ({
        message: 'Lỗi khi kiểm tra cập nhật.',
        buttons: <MainButton label={'Đóng'} onPress={onPostpone} />,
      }),
      CHECK_UPDATE: () => ({
        message: 'Kiểm tra cập nhật...',
        buttons: <MainButton label={'Kiểm tra'} onPress={onCheckUpdate} />,
      }),
      DEFAULT: () => ({
        // Thêm default case
        message: 'Trạng thái cập nhật không xác định',
        buttons: null,
      }),
    }),
    [onPostpone, onUpdate, onCheckUpdate, progressPercent], // Thêm dependencies cần thiết
  );

  useEffect(() => {
    const caseResult = updateInfoCase[updateInfo] || updateInfoCase.DEFAULT; // Lấy case tương ứng hoặc default
    const {message, buttons} = caseResult(); // Gọi function và lấy message và buttons từ return object
    setUpdateMessage(message); // Cập nhật state message
    setUpdateButtons(buttons); // Cập nhật state buttons
  }, [updateInfo, updateInfoCase]);
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
      title={updateMessage}>
      <View bg-black padding-20>
        <View center gap-12>
          {showProgress && (
            <ActivityIndicator
              size="large"
              color="#007BFF"
              style={{marginTop: 10, marginBottom: 15}}
            />
          )}
          {updateButtons && <View center>{updateButtons}</View>}
        </View>
      </View>
    </CustomDialog>
  );
};

export default UpdatePopup;
