/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {View, Colors, TextField, Typography} from 'react-native-ui-lib';
import {PostStyle} from '../../../models/setting.model';
import {t} from '../../../languages/i18n';

const width = Dimensions.get('window').width;
interface ItemStandardProps {
  onChangeText?: (text: string) => void;
  caption?: string;
  postStyle: PostStyle;
}

const ItemStandard: React.FC<ItemStandardProps> = ({
  caption,
  onChangeText,
  postStyle,
}) => {
  return (
    <View width={width - 24}>
      <LinearGradient
        colors={[
          postStyle.color_top || Colors.grey40,
          postStyle.color_bot || Colors.grey40,
        ]}
        style={{borderRadius: 999}}>
        <TextField
          placeholder={t('enter_caption_here')}
          placeholderTextColor={postStyle.text_color}
          paddingV-10
          color={postStyle.text_color}
          paddingH-16
          cursorColor={Colors.primary}
          style={{...Typography.text70BL}}
          onChangeText={onChangeText}
          multiline
          value={caption}
        />
      </LinearGradient>
    </View>
  );
};

export default ItemStandard;
