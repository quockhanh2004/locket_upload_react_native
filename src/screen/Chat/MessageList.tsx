import React, {useEffect, useRef, forwardRef} from 'react';
import {FlatList} from 'react-native';
import {ChatMessageType} from '../../models/chat.model';
import ItemMessage from './ItemMessage';

interface Props {
  messages: ChatMessageType[];
  currentUserId?: string;
  scrollToMessageId?: string;
  ListFooterComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;
}

const MessageList = forwardRef<FlatList<ChatMessageType>, Props>(
  (
    {messages, currentUserId, scrollToMessageId, ListFooterComponent}: Props,
    ref,
  ) => {
    const flatListRef = useRef<FlatList<ChatMessageType>>(null);

    // Truyền ref từ ngoài vào trong
    useEffect(() => {
      if (ref && flatListRef.current) {
        if (typeof ref === 'function') {
          ref(flatListRef.current);
        } else {
          (ref as React.MutableRefObject<FlatList<ChatMessageType>>).current =
            flatListRef.current;
        }
      }
    }, [ref]);

    useEffect(() => {
      if (scrollToMessageId && flatListRef.current) {
        const index = messages.findIndex(msg => msg.id === scrollToMessageId);
        if (index !== -1) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({index, animated: false});
          }, 100); // Delay để đảm bảo layout đã xong
        }
      } else {
        flatListRef.current?.scrollToEnd({animated: false});
      }
    }, [messages, scrollToMessageId]);

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({item}) => (
          <ItemMessage item={item} sendByMe={item.sender === currentUserId} />
        )}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={ListFooterComponent}
        getItemLayout={(data, index) => ({
          length: 70, // Chiều cao của mỗi item (tính theo pixel)
          offset: 70 * index, // Vị trí của item này
          index,
        })}
      />
    );
  },
);

MessageList.displayName = 'MessageList';

export default MessageList;
