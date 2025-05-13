import React, {useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
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
  ({messages, currentUserId, scrollToMessageId, ListFooterComponent}, ref) => {
    const flatListRef = useRef<FlatList<ChatMessageType>>(null);

    // Expose internal FlatList to parent
    useImperativeHandle(
      ref,
      () => flatListRef.current as FlatList<ChatMessageType>,
      [],
    );

    useEffect(() => {
      if (!flatListRef.current) {
        return;
      }

      if (scrollToMessageId) {
        const index = messages.findIndex(msg => msg.id === scrollToMessageId);
        if (index !== -1) {
          // Scroll đến item nếu đã render (nằm trong visible range)
          flatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 1, // cuộn để item nằm cuối màn hình
          });
        } else {
          // Nếu index không có, fallback: cuộn xuống cuối
          flatListRef.current.scrollToEnd({animated: true});
        }
      } else {
        flatListRef.current.scrollToEnd({animated: true});
      }
    }, [messages, scrollToMessageId]);

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({item, index}) => (
          <ItemMessage
            item={item}
            sendByMe={item.sender === currentUserId}
            previousItem={index > 0 ? messages[index - 1] : undefined}
            nextItem={
              index < messages.length - 1 ? messages[index + 1] : undefined
            }
          />
        )}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews={true}
        onScrollToIndexFailed={({index}) => {
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({
              offset: Math.max(0, index - 3) * 100,
              animated: true,
            });
          }, 300);
        }}
      />
    );
  },
);

MessageList.displayName = 'MessageList';

export default MessageList;
