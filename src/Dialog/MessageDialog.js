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
import {clearMessage} from '../redux/slice/message.slice';
import CustomDialog from './CustomDialog';
import {ScrollView} from 'react-native';

const MessageDialog = () => {
  const dispatch = useDispatch();
  const {message, type, hideButton, progress} = useSelector(
    state => state.message,
  );

  const handleClearMessage = () => {
    dispatch(clearMessage());
  };
  return (
    <CustomDialog
      visible={message}
      onDismiss={handleClearMessage}
      title={type}
      panDirection={Dialog.directions.DOWN}
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
        textAlign: 'left',
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
      }}>
      <ScrollView>
        <Text white text70BL>
          {message}
        </Text>
      </ScrollView>
      {!hideButton && (
        <Button
          label="Ok"
          onPress={handleClearMessage}
          borderRadius={8}
          text70BL
          backgroundColor={Colors.primary}
        />
      )}
      {progress && (
        <ProgressBar progress={progress} progressColor={Colors.primary} />
      )}
    </CustomDialog>
  );
};

export default MessageDialog;
