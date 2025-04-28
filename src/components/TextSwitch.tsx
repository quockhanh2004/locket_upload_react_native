/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Colors, View, Text} from 'react-native-ui-lib';
import {Language} from '../models/language.model';
import {Pressable} from 'react-native';

interface TextSwitchProps {
  onChange: (text: string) => void;
  value: string;
  option?: any[];
}

export const TextSwitch: React.FC<TextSwitchProps> = ({
  onChange,
  value,
  option,
}) => {
  const toggleLang = () => {
    const newLang = value === Language.EN ? Language.VI : Language.EN;

    if (option) {
      const newValue = option.indexOf(value) === 0 ? option[1] : option[0];
      onChange(newValue);
      return;
    }

    onChange(newLang);
  };

  const renderOption = (text: string) => {
    const isActive = text === value;
    return (
      <View
        center
        style={{
          flex: 1,
          height: '100%',
          borderRadius: 999,
          backgroundColor: isActive ? Colors.primary : Colors.transparent,
        }}>
        <Text text70BL color={isActive ? Colors.black : Colors.white}>
          {text.toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <Pressable
      onPress={toggleLang}
      style={{
        flexDirection: 'row',
        height: 40,
        borderRadius: 999,
        backgroundColor: Colors.grey20,
        overflow: 'hidden',
      }}>
      {renderOption(option ? option[0] : Language.EN)}
      {renderOption(option ? option[1] : Language.VI)}
    </Pressable>
  );
};
