/* eslint-disable react-native/no-inline-styles */
import React, {useRef, forwardRef, useImperativeHandle, useState} from 'react';
import {FlatList, NativeSyntheticEvent, NativeScrollEvent} from 'react-native';
import {ChatMessageType} from '../../models/chat.model';
import ItemMessage from './ItemMessage';
import {Colors, Text, TouchableOpacity} from 'react-native-ui-lib';

interface Props {
  messages: ChatMessageType[];
  currentUserId?: string;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  onLoadMore?: () => void;
}

const MessageList = forwardRef<FlatList<ChatMessageType>, Props>(
  ({messages, currentUserId, ListFooterComponent, onLoadMore}, ref) => {
    const flatListRef = useRef<FlatList<ChatMessageType>>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    useImperativeHandle(
      ref,
      () => flatListRef.current as FlatList<ChatMessageType>,
      [],
    );

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset} = event.nativeEvent;
      const threshold = 20; // tweak nếu cần
      setIsAtBottom(contentOffset.y <= threshold);
    };

    return (
      <>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({item, index}) => (
            <ItemMessage
              item={item}
              sendByMe={item.sender === currentUserId}
              previousItem={
                index < messages.length - 1 ? messages[index + 1] : undefined
              }
              nextItem={index > 0 ? messages[index - 1] : undefined}
            />
          )}
          inverted
          contentContainerStyle={{flexGrow: 1}}
          ListFooterComponent={ListFooterComponent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          onScroll={handleScroll}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.9}
          scrollEventThrottle={100}
        />
        {!isAtBottom && (
          <TouchableOpacity
            onPress={() => {
              flatListRef.current?.scrollToOffset({offset: 0, animated: true});
            }}
            style={{
              position: 'absolute',
              bottom: 80,
              right: 16,
              backgroundColor: Colors.blue,
              padding: 8,
              borderRadius: 20,
            }}>
            <Text style={{color: 'white'}}>⬇ Tin nhắn mới</Text>
          </TouchableOpacity>
        )}
      </>
    );
  },
);

MessageList.displayName = 'MessageList';
export default MessageList;
