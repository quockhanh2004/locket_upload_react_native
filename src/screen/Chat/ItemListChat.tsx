import React from 'react';
import {View, Text, TouchableOpacity, Typography} from 'react-native-ui-lib';
import {ListChatType} from '../../models/chat.model';
import {RootState} from '../../redux/store';
import {useSelector} from 'react-redux';
import CustomAvatar from '../../components/Avatar';
import {t} from '../../languages/i18n';
import {timeDiffFromNow} from '../../util/convertTime';

interface ItemListChatProps {
  itemChat: ListChatType;
  onPress?: () => void;
}

const ItemListChat: React.FC<ItemListChatProps> = ({itemChat, onPress}) => {
  const {create_time, is_read, latest_message, sender, with_user} = itemChat;
  const {friends} = useSelector((state: RootState) => state.friends);

  const friend = friends?.find(item => item.uid === with_user);

  const cropText = (text: string) => {
    if (text?.length > 30) {
      return text?.slice(0, 25) + '...';
    }
    return text;
  };
  return (
    <TouchableOpacity onPress={onPress}>
      <View row gap-12 margin-12 centerV>
        <CustomAvatar
          url={friend?.profile_picture_url}
          size={42}
          border={!is_read}
          text={`${friend?.first_name?.at(0)}${friend?.last_name?.at(0)}`}
        />
        <View spread row centerV flex>
          <View gap-2>
            <Text
              white
              style={
                !is_read ? Typography.text70BL : Typography.text70L
              }>{`${friend?.first_name} ${friend?.last_name}`}</Text>
            <Text
              white
              style={!is_read ? Typography.text70BL : Typography.text70L}>
              {sender === with_user ? friend?.first_name : t('you')}:{' '}
              {cropText(latest_message)}
            </Text>
          </View>
          <Text white>{timeDiffFromNow(parseInt(create_time, 10))}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ItemListChat);
