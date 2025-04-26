/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {View, Text, Colors} from 'react-native-ui-lib';
import {PostStyle} from '../../../models/setting.model';
import {getCurrentTime} from '../../../util/convertTime';

const width = Dimensions.get('window').width;

interface ItemTimeProps {
  postStyle: PostStyle;
}

const ItemTime: React.FC<ItemTimeProps> = ({postStyle}) => {
  return (
    <View width={width - 24} center style={{borderRadius: 999}}>
      <LinearGradient
        colors={[
          postStyle.color_top || Colors.grey40,
          postStyle.color_bot || Colors.grey40,
        ]}
        style={{borderRadius: 999, padding: 14}}>
        <Text white color={postStyle.text_color} center text70BL>
          {`🕒 ${getCurrentTime()}`}
        </Text>
      </LinearGradient>
    </View>
  );
};

export default ItemTime;
