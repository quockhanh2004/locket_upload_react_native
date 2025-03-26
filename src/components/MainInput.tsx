/* eslint-disable react-native/no-inline-styles */
import {Colors, Typography} from 'react-native-ui-lib';
import React from 'react';
import InputView from './InputView';

interface MainInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
}

const MainInput = ({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
}: MainInputProps) => {
  return (
    <InputView
      width={'100%'}
      value={value}
      onChangeText={onChangeText}
      showClear={value.length > 0}
      bgColor={Colors.black}
      borderColor={Colors.grey40}
      borderWidth={1}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      inputStyle={{color: Colors.grey40, ...Typography.text70BL}}
      style={{paddingLeft: 10}}
    />
  );
};

export default MainInput;
