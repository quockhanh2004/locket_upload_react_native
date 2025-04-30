/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Dialog,
  Typography,
  Colors,
  Text,
  TouchableOpacity,
  ColorSwatch,
} from 'react-native-ui-lib';
import CustomDialog from './CustomDialog';
import LinearGradient from 'react-native-linear-gradient';
import {ColorDefault, ColorsSelect} from '../util/colors';
import {PostStyle} from '../models/setting.model';
import MainButton from '../components/MainButton';
import {FlatList} from 'react-native';
import {t} from '../languages/i18n';
import {hapticFeedback} from '../util/haptic';

interface SelectColorDialogProps {
  visible: boolean;
  value: PostStyle;
  onDismiss: () => void;
  onSelectColor: (color: PostStyle) => void;
}

enum IndexColor {
  TOP,
  BOT,
  TEXT,
}

const colorKeys = [
  {label: 'TOP', key: IndexColor.TOP},
  {label: 'TEXT', key: IndexColor.TEXT},
  {label: 'BOTTOM', key: IndexColor.BOT},
];

const SelectColorDialog: React.FC<SelectColorDialogProps> = ({
  visible,
  value,
  onDismiss,
  onSelectColor,
}) => {
  const [indexColor, setIndexColor] = useState(IndexColor.TOP);
  const flatListRef = useRef<FlatList<string>>(null);

  const getCurrentColor = useCallback(() => {
    switch (indexColor) {
      case IndexColor.TOP:
        return value.color_top;
      case IndexColor.BOT:
        return value.color_bot;
      case IndexColor.TEXT:
        return value.text_color;
    }
  }, [indexColor, value.color_bot, value.color_top, value.text_color]);

  const handleSelectColor = (key: IndexColor) => {
    hapticFeedback();
    setIndexColor(key);
  };

  const handleColorChange = (val: string) => {
    onSelectColor({
      color_top: indexColor === IndexColor.TOP ? val : value.color_top,
      color_bot: indexColor === IndexColor.BOT ? val : value.color_bot,
      text_color: indexColor === IndexColor.TEXT ? val : value.text_color,
    });
  };

  const handleReset = () => {
    onSelectColor(ColorDefault);
  };

  useEffect(() => {
    const currentColor = getCurrentColor();
    const index = ColorsSelect.findIndex(c => c === currentColor);
    if (index >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({index, animated: true});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexColor]);

  return (
    <CustomDialog
      visible={visible}
      onDismiss={onDismiss}
      panDirection={Dialog.directions.DOWN}
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
        textAlign: 'left',
        width: '100%',
      }}
      bottom
      width={'98%'}
      containerStyle={{
        backgroundColor: 'black',
        borderWidth: 1,
        borderBottomWidth: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
        borderColor: Colors.grey20,
        gap: 4,
        padding: 12,
        paddingBottom: 24,
        borderRadius: 10,
        overflow: 'hidden',
      }}>
      <View>
        <View row spread>
          <View gap-8>
            {colorKeys.map(({label, key}) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleSelectColor(key)}>
                <Text
                  color={indexColor === key ? Colors.primary : Colors.white}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View center row gap-12>
            <MainButton label={t('reset')} onPress={handleReset} />
            <LinearGradient
              colors={[
                value.color_top || Colors.grey40,
                value.color_bot || Colors.grey40,
              ]}
              style={{
                borderRadius: 999,
                padding: 12,
                justifyContent: 'center',
              }}>
              <Text color={value.text_color} text70BL>
                {t('this_text_sample')}
              </Text>
            </LinearGradient>
          </View>
        </View>

        <View marginT-12>
          <FlatList
            data={ColorsSelect}
            horizontal
            ref={flatListRef}
            initialNumToRender={20}
            renderItem={({item, index}) => {
              return (
                <View>
                  <ColorSwatch
                    key={index}
                    value={item}
                    color={item}
                    onPress={handleColorChange}
                    selected={getCurrentColor() === item}
                    style={{borderWidth: 1, borderColor: Colors.white}}
                  />
                </View>
              );
            }}
          />
        </View>

        <MainButton label={t('done')} onPress={onDismiss} />
      </View>
    </CustomDialog>
  );
};

export default SelectColorDialog;
