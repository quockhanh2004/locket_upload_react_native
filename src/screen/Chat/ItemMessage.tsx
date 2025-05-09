/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, Colors} from 'react-native-ui-lib';
import {ChatMessageType} from '../../models/chat.model';

interface ItemMessageProps {
  item: ChatMessageType;
  sendByMe?: boolean;
}

const ItemMessage: React.FC<ItemMessageProps> = ({item, sendByMe}) => {
  return (
    <View
      row
      flex
      marginV-8
      style={{
        justifyContent: sendByMe ? 'flex-end' : 'flex-start',
        alignItems: sendByMe ? 'flex-end' : 'flex-start',
      }}>
      <Text
        style={{
          backgroundColor: sendByMe ? Colors.primary : Colors.grey40,
          padding: 10,
          borderRadius: 20,
          maxWidth: '80%',
        }}
        textAlign={sendByMe ? 'right' : 'left'}>
        {item.text}
      </Text>
    </View>
  );
};

export default React.memo(ItemMessage);
