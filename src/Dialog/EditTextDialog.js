/* eslint-disable react-native/no-inline-styles */
import {Colors, Dialog, Typography, View} from 'react-native-ui-lib';
import React, {useEffect, useState} from 'react';
import CustomDialog from './CustomDialog';
import MainButton from '../component/MainButton';
import MainInput from '../component/MainInput';

const EditTextDialog = ({
  value,
  value2,
  visible,
  onDismiss,
  label,
  isLoading,
  onConfirm,
  isEditName = false,
  placeholder,
  placeholder2,
}) => {
  const [text, setText] = useState(value);
  const [text2, setText2] = useState(value2);

  useEffect(() => {
    // console.log(value, value2);

    setText(value);
    setText2(value2);
  }, [value, value2]);

  return (
    <CustomDialog
      visible={visible}
      onDismiss={onDismiss}
      bottom
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
        textAlign: 'left',
        width: '100%',
      }}
      title={label}
      panDirection={Dialog.directions.DOWN}
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
      <View gap-12>
        <MainInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={Colors.grey40}
        />
        {isEditName && (
          <MainInput
            value={text2}
            onChangeText={setText2}
            placeholder={placeholder2}
            placeholderTextColor={Colors.grey40}
          />
        )}
        <MainButton
          label={'Update'}
          onPress={() => {
            onConfirm(text, isEditName ? text2 : undefined);
          }}
          isLoading={isLoading}
        />
      </View>
    </CustomDialog>
  );
};

export default EditTextDialog;
