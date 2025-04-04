/* eslint-disable react-native/no-inline-styles */
import React, {useMemo} from 'react';
import {
  View,
  Dialog,
  Typography,
  Colors,
  ProgressBar,
  Text,
} from 'react-native-ui-lib';
import CustomDialog from './CustomDialog';
import MainButton from '../components/MainButton';

type UpdateInfoType =
  | 'CHECKING_FOR_UPDATE'
  | 'UPDATE_AVAILABLE'
  | 'DOWNLOADING_PACKAGE'
  | 'INSTALLING_UPDATE'
  | 'UP_TO_DATE'
  | 'UPDATE_INSTALLED'
  | 'ERROR'
  | 'CHECK_UPDATE'
  | 'APK_UPDATE_AVAILABLE';

interface UpdatePopupProps {
  isVisible: boolean;
  updateInfo: UpdateInfoType;
  apkUpdateInfo?: {
    latestVersion: string;
    downloadUrl: string;
    updateInfo: UpdateInfoType;
  };
  progress?: number;
  onUpdate: () => void;
  onUpdateApk: () => void;
  decriptionUpdate?: string;
  onCheckUpdate: () => void;
  onPostpone: () => void;
}

const UpdatePopup = ({
  isVisible,
  updateInfo,
  apkUpdateInfo,
  progress,
  onUpdate,
  onUpdateApk,
  decriptionUpdate,
  onCheckUpdate,
  onPostpone,
}: UpdatePopupProps) => {
  const progressPercent = progress ? Math.floor(progress * 100) : 0;

  // Xác định trạng thái hiển thị ProgressBar
  const showProgress =
    updateInfo === 'DOWNLOADING_PACKAGE' || updateInfo === 'INSTALLING_UPDATE';

  const updateState = useMemo(
    () => ({
      CHECKING_FOR_UPDATE: {
        message: 'Đang kiểm tra cập nhật...',
        buttons: null,
      },
      UPDATE_AVAILABLE: {
        message: 'Có bản cập nhật mới!',
        buttons: (
          <MainButton label="Cập nhật" onPress={onUpdate} isLoading={false} />
        ),
      },
      DOWNLOADING_PACKAGE: {
        message: `Đang tải xuống: ${progressPercent}%`,
        buttons: null,
      },
      INSTALLING_UPDATE: {
        message: 'Đang cài đặt bản cập nhật...',
        buttons: null,
      },
      UP_TO_DATE: {
        message: 'Bạn đã cập nhật phiên bản mới nhất',
        buttons: (
          <MainButton label="Đóng" onPress={onPostpone} isLoading={false} />
        ),
      },
      UPDATE_INSTALLED: {
        message: 'Cập nhật thành công! Ứng dụng sẽ khởi động lại.',
        buttons: (
          <MainButton label="Đóng" onPress={onPostpone} isLoading={false} />
        ),
      },
      ERROR: {
        message: 'Lỗi khi kiểm tra cập nhật.',
        buttons: (
          <MainButton label="Đóng" onPress={onPostpone} isLoading={false} />
        ),
      },
      CHECK_UPDATE: {
        message: 'Kiểm tra cập nhật...',
        buttons: (
          <MainButton
            label="Kiểm tra"
            onPress={onCheckUpdate}
            isLoading={false}
          />
        ),
      },
      APK_UPDATE_AVAILABLE: {
        message: 'Có bản cập nhật apk mới!',
        buttons: (
          <MainButton
            label="Cập nhật apk"
            onPress={onUpdateApk}
            isLoading={false}
          />
        ),
      },
    }),
    [onUpdate, progressPercent, onPostpone, onCheckUpdate, onUpdateApk],
  );

  // Cập nhật UI khi updateInfo thay đổi
  const {message, buttons} = apkUpdateInfo
    ? updateState[apkUpdateInfo.updateInfo as UpdateInfoType]
    : updateState[updateInfo] || updateState.UP_TO_DATE;

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
      <View bg-black padding-20 paddingT-0>
        {decriptionUpdate && (
          <View paddingB-12>
            <Text white text70BL>
              Thông tin cập nhật:
            </Text>
            <Text white> - {decriptionUpdate}</Text>
          </View>
        )}
        {showProgress && (
          <ProgressBar
            progress={progressPercent}
            progressColor={Colors.primary}
          />
        )}
        <View center gap-12>
          {buttons && <View center>{buttons}</View>}
        </View>
      </View>
    </CustomDialog>
  );
};

export default UpdatePopup;
