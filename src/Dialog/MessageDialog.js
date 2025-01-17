/* eslint-disable react-native/no-inline-styles */
import {Text, Button, Colors, Typography} from 'react-native-ui-lib';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {clearMessage} from '../redux/slice/message.slice';
import CustomDialog from './CustomDialog';
import {Directions} from 'react-native-gesture-handler';
import {ScrollView} from 'react-native';

const MessageDialog = () => {
  const dispatch = useDispatch();
  const {message, type} = useSelector(state => state.message);

  const handleClearMessage = () => {
    dispatch(clearMessage());
  };
  return (
    <CustomDialog
      visible={message}
      onDismiss={handleClearMessage}
      title={type}
      panDirection={Directions.DOWN}
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
        textAlign: 'left',
        width: '100%',
      }}
      bottom
      width={'100%'}
      maxHeight={'100%'}
      containerStyle={{
        backgroundColor: 'black',
        borderWidth: 1,
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
      <Button
        label="Ok"
        onPress={handleClearMessage}
        borderRadius={8}
        text70BL
        backgroundColor={Colors.primary}
      />
    </CustomDialog>
  );
};

export default MessageDialog;
