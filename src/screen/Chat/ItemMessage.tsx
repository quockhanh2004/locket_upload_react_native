/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Colors, TouchableOpacity, Text} from 'react-native-ui-lib';
import {Dimensions} from 'react-native';
import {Linking} from 'react-native';
import {ChatMessageType} from '../../models/chat.model';
import ImageView from '../Moment/PostPagerItem/ImageView';
import {hapticFeedback} from '../../util/haptic';

interface ItemMessageProps {
  previousItem?: ChatMessageType;
  nextItem?: ChatMessageType;
  item: ChatMessageType;
  sendByMe?: boolean;
  onLongPress?: (text: string) => void;
}

const screenWidth = Dimensions.get('window').width;
const MAX_BORDER_RADIUS = 20;
const MIN_BORDER_RADIUS = 2;

const REGEX_LINK =
  /\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi;

const parseMessage = (text: string) => {
  const parts: {type: 'text' | 'link'; value: string}[] = [];

  let lastIndex = 0;
  if (!text) {
    return parts;
  }
  const matches = [...text.matchAll(REGEX_LINK)];

  for (const match of matches) {
    const start = match.index ?? 0;
    const end = start + match[0].length;

    if (start > lastIndex) {
      parts.push({type: 'text', value: text.slice(lastIndex, start)});
    }

    parts.push({type: 'link', value: match[0]});
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push({type: 'text', value: text.slice(lastIndex)});
  }

  return parts;
};

const ItemMessage: React.FC<ItemMessageProps> = ({
  item,
  sendByMe,
  previousItem,
  nextItem,
  onLongPress,
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

  const handleLongPress = () => {
    if (onLongPress) {
      hapticFeedback();
      onLongPress(item.text);
    }
  };

  const handlePress = (url: string) => {
    if (url) {
      hapticFeedback();
      Linking.openURL(url);
    }
  };

  const renderParsedText = () => {
    if (!item.text) {
      console.log(item);

      return null;
    }
    const parsedParts = parseMessage(item.text);

    return (
      <Text
        // onLongPress={handleLongPress}
        color={sendByMe ? Colors.black : Colors.white}
        style={{
          backgroundColor: sendByMe ? Colors.primary : Colors.grey20,
          padding: 8,
          maxWidth: '80%',
          minWidth: '5%',
          ...getBorderRadius(),

          textAlign: sendByMe ? 'right' : 'left',
        }}>
        {parsedParts.map((part, idx) => {
          if (part.type === 'link') {
            const display = part.value;
            const link = part.value.startsWith('http')
              ? part.value
              : `https://${part.value}`;
            return (
              <Text
                key={idx}
                style={{textDecorationLine: 'underline', color: '#2980b9'}}
                onPress={() => handlePress(link)}>
                {display}
              </Text>
            );
          }
          return (
            <Text key={idx} color={sendByMe ? Colors.black : Colors.white}>
              {part.value}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      delayLongPress={180}
      style={{
        flex: 1,
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
      {renderParsedText()}
    </TouchableOpacity>
  );
};

export default React.memo(ItemMessage);
