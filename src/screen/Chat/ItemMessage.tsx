/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, Colors} from 'react-native-ui-lib';
import {ChatMessageType} from '../../models/chat.model';
import ImageView from '../Moment/PostPagerItem/ImageView';
import {Dimensions} from 'react-native';

interface ItemMessageProps {
  previousItem?: ChatMessageType;
  nextItem?: ChatMessageType;
  item: ChatMessageType;
  sendByMe?: boolean;
}

const screenWidth = Dimensions.get('window').width;
const MAX_BORDER_RADIUS = 20;
const MIN_BORDER_RADIUS = 2;

const ItemMessage: React.FC<ItemMessageProps> = ({
  item,
  sendByMe,
  previousItem,
  nextItem,
}) => {
  const getBorderRadius = () => {
    if (sendByMe) {
      return {
        borderTopRightRadius:
          previousItem?.sender === item.sender
            ? MIN_BORDER_RADIUS
            : MAX_BORDER_RADIUS,
        borderBottomRightRadius:
          nextItem?.sender === item.sender
            ? MIN_BORDER_RADIUS
            : MAX_BORDER_RADIUS,

        borderTopLeftRadius: MAX_BORDER_RADIUS,
        borderBottomLeftRadius: MAX_BORDER_RADIUS,
      };
    }
    return {
      borderTopLeftRadius:
        previousItem?.sender === item.sender
          ? MIN_BORDER_RADIUS
          : MAX_BORDER_RADIUS,
      borderBottomLeftRadius:
        nextItem?.sender === item.sender
          ? MIN_BORDER_RADIUS
          : MAX_BORDER_RADIUS,
      borderTopRightRadius: MAX_BORDER_RADIUS,
      borderBottomRightRadius: MAX_BORDER_RADIUS,
    };
  };
  return (
    <>
      <View
        flex
        style={{
          justifyContent: sendByMe ? 'flex-end' : 'flex-start',
          alignItems: sendByMe ? 'flex-end' : 'flex-start',
          marginTop: previousItem?.sender === item.sender ? 2 : 10,
        }}>
        {item?.thumbnail_url && (
          <View marginT-20 marginB-2>
            <ImageView
              uri={item.thumbnail_url}
              customStyle={{
                width: screenWidth - 50,
                height: screenWidth - 50,
                aspectRatio: 1,
                borderRadius: 20,
                backgroundColor: '#333',
                justifyContent: 'center',
              }}
            />
          </View>
        )}
        <Text
          style={{
            backgroundColor: sendByMe ? Colors.primary : Colors.grey40,
            padding: 8,
            maxWidth: '80%',
            minWidth: '5%',
            ...getBorderRadius(),
          }}
          color={!sendByMe ? Colors.white : Colors.black}
          textAlign={sendByMe ? 'right' : 'left'}>
          {item.text}
        </Text>
      </View>
    </>
  );
};

export default React.memo(ItemMessage);
