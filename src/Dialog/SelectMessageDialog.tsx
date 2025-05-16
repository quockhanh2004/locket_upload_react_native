/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Text,
  TouchableOpacity,
  Colors,
  Dialog,
  Typography,
} from 'react-native-ui-lib';
import CustomDialog from './CustomDialog';

interface SelectMessageDialogProps {
  option: {
    title: string;
    value: string;
    color?: string;
  }[];
  isVisible: boolean;
  onDismiss: () => void;
  onSelect: (option: string) => void;
}

const SelectMessageDialog: React.FC<SelectMessageDialogProps> = ({
  option,
  isVisible,
  onSelect,
  onDismiss,
}) => {
  return (
    <CustomDialog
      visible={isVisible}
      panDirection={Dialog.directions.DOWN}
      onDismiss={onDismiss}
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
      }}>
      {option.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            onDismiss();
            onSelect(item.value);
          }}
          style={{
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors.grey20,
          }}>
          <Text text70BL center color={item.color || 'white'}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </CustomDialog>
  );
};

export default SelectMessageDialog;
