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
import CustomDialog from './CustomDialog.tsx';
import MainButton from '../MainButton.tsx';
import {t} from '../../languages/i18n.ts';
import {UpdateInfoType} from '../../models/update.model.ts';

interface AutoCheckUpdateDialogProps {
  isVisible: boolean;
  updateInfo?: UpdateInfoType | null;
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

const AutoCheckUpdateDialog = ({
  isVisible,
  updateInfo,
  apkUpdateInfo,
  progress,
  onUpdate,
  onUpdateApk,
  decriptionUpdate,
  onCheckUpdate,
  onPostpone,
}: AutoCheckUpdateDialogProps) => {
  const progressPercent = progress ? Math.floor(progress * 100) : 0;

  // Xác định trạng thái hiển thị ProgressBar
  const showProgress =
    updateInfo === 'DOWNLOADING_PACKAGE' || updateInfo === 'INSTALLING_UPDATE';

  const updateState = useMemo(
    () => ({
      CHECKING_FOR_UPDATE: {
        message: t('checking_for_update'),
        buttons: null,
      },
      UPDATE_AVAILABLE: {
        message: t('update_avaliable'),
        buttons: (
          <>
            <MainButton
              label={t('cancel')}
              onPress={onPostpone}
              backgroundColor={Colors.grey40}
            />
            <MainButton
              label={t('update')}
              onPress={onUpdate}
              isLoading={false}
            />
          </>
        ),
      },
      DOWNLOADING_PACKAGE: {
        message: `${t('downloading')}: ${progressPercent}%`,
        buttons: null,
      },
      INSTALLING_UPDATE: {
        message: t('installing_update'),
        buttons: null,
      },
      UP_TO_DATE: {
        message: t('up_to_date'),
        buttons: (
          <MainButton
            label={t('close')}
            onPress={onPostpone}
            isLoading={false}
          />
        ),
      },
      UPDATE_INSTALLED: {
        message: t('update_complete'),
        buttons: (
          <MainButton
            label={t('close')}
            onPress={onPostpone}
            isLoading={false}
          />
        ),
      },
      ERROR: {
        message: t('error_checking_for_update'),
        buttons: (
          <MainButton
            label={t('close')}
            onPress={onPostpone}
            isLoading={false}
          />
        ),
      },
      CHECK_UPDATE: {
        message: t('check_update'),
        buttons: (
          <MainButton
            label={t('check')}
            onPress={onCheckUpdate}
            isLoading={false}
          />
        ),
      },
      APK_UPDATE_AVAILABLE: {
        message: t('apk_update_avaliable'),
        buttons: (
          <>
            <MainButton
              label={t('cancel')}
              onPress={onPostpone}
              backgroundColor={Colors.grey40}
            />
            <MainButton
              label={t('update')}
              onPress={onUpdateApk}
              isLoading={false}
            />
          </>
        ),
      },
    }),
    [onPostpone, onUpdate, progressPercent, onCheckUpdate, onUpdateApk],
  );

  // Cập nhật UI khi updateInfo thay đổi
  const {message, buttons} = apkUpdateInfo
    ? updateState[apkUpdateInfo.updateInfo as UpdateInfoType]
    : updateInfo
    ? updateState[updateInfo]
    : updateState.UP_TO_DATE;

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
              {t('update_info')}:
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
        {buttons && (
          <View center gap-12 row>
            {buttons}
          </View>
        )}
      </View>
    </CustomDialog>
  );
};

export default AutoCheckUpdateDialog;
