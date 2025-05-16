/* eslint-disable react-native/no-inline-styles */
import {
  Text,
  Button,
  Colors,
  Typography,
  Dialog,
  ProgressBar,
} from 'react-native-ui-lib';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {clearMessage, setTask} from '../redux/slice/message.slice';
import CustomDialog from './CustomDialog';
import {ScrollView} from 'react-native';
import {AppDispatch, RootState} from '../redux/store';
import {t} from '../languages/i18n';

const MessageDialog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {message, type, hideButton, progress, task} = useSelector(
    (state: RootState) => state.message,
  );

  const handleClearMessage = () => {
    dispatch(clearMessage());
  };
  return (
    <CustomDialog
      visible={!!message}
      onDismiss={handleClearMessage}
      title={type?.toUpperCase() || ''}
      panDirection={Dialog.directions.DOWN}
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
        textAlign: 'left',
        width: '100%',
        lineHeight: 36,
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
      }}>
      <ScrollView>
        <Text white text70BL>
          {message}
        </Text>
      </ScrollView>
      {!hideButton && (
        <Button
          label={t('close')}
          onPress={handleClearMessage}
          borderRadius={8}
          text70BL
          backgroundColor={Colors.primary}
        />
      )}
      {typeof progress === 'number' && (
        <>
          <ProgressBar progress={progress} progressColor={Colors.primary} />
        </>
      )}
      {task && type !== t('error') && type !== t('success') && (
        <Button
          label={t('cancel')}
          onPress={() => {
            if (task) {
              task.abort();
              dispatch(setTask(null));
            }
          }}
          borderRadius={8}
          text70BL
          backgroundColor={Colors.red30}
        />
      )}
    </CustomDialog>
  );
};

export default MessageDialog;
