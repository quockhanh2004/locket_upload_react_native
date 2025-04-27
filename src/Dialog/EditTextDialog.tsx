/* eslint-disable react-native/no-inline-styles */
import {Colors, Dialog, Typography, View} from 'react-native-ui-lib';
import React, {useEffect, useState} from 'react';
import CustomDialog from './CustomDialog';
import MainButton from '../components/MainButton';
import MainInput from '../components/MainInput';
import {t} from '../languages/i18n';

interface EditTextDialogProps {
  value: string;
  value2?: string;
  visible: boolean;
  onDismiss: () => void;
  label: string;
  isLoading: boolean;
  onConfirm: (text: string, text2: string) => void;
  isEditName?: boolean;
  placeholder?: string;
  placeholder2?: string;
}

const EditTextDialog = ({
  value,
  value2 = '',
  visible,
  onDismiss,
  label,
  isLoading,
  onConfirm,
  isEditName = false,
  placeholder,
  placeholder2,
}: EditTextDialogProps) => {
  const [text, setText] = useState<string>(value);
  const [text2, setText2] = useState<string>(value2 || '');

  useEffect(() => {
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
          label={t('update')}
          onPress={() => {
            onConfirm(text, text2);
          }}
          isLoading={isLoading}
        />
      </View>
    </CustomDialog>
  );
};

export default EditTextDialog;
