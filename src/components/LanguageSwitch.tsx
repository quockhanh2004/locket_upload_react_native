/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Colors, View, Text} from 'react-native-ui-lib';
import {Language} from '../models/language.model';
import {Pressable} from 'react-native';

interface LanguageSwitchProps {
  onChange: (lang: Language) => void;
  currentLanguage: Language;
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  onChange,
  currentLanguage,
}) => {
  const toggleLang = () => {
    const newLang = currentLanguage === Language.EN ? Language.VI : Language.EN;
    onChange(newLang);
  };

  const renderOption = (lang: Language) => {
    const isActive = lang === currentLanguage;
    return (
      <View
        center
        style={{
          flex: 1,
          height: '100%',
          borderRadius: 999,
          backgroundColor: isActive ? Colors.primary : Colors.transparent,
        }}>
        <Text text70BL color={isActive ? Colors.white : Colors.black}>
          {lang.toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <Pressable
      onPress={toggleLang}
      style={{
        flexDirection: 'row',
        width: 120,
        height: 40,
        borderRadius: 999,
        backgroundColor: Colors.grey80,
        overflow: 'hidden',
      }}>
      {renderOption(Language.EN)}
      {renderOption(Language.VI)}
    </Pressable>
  );
};
