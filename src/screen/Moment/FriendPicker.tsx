/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useMemo} from 'react';
import {Modal, FlatList, Dimensions} from 'react-native';
import {TouchableOpacity, Text, View, Image, Colors} from 'react-native-ui-lib';
import {Friend} from '../../models/friend.model';
import {User} from '../../models/user.model';
import {t} from '../../languages/i18n.ts';

import {hapticFeedback} from '../../utils/device.ts';

const screenHeight = Dimensions.get('window').height;

interface FriendPickerProps {
  value?: Friend | null;
  friends: Friend[];
  user: User;
  onSelect: (friend: Friend | null) => void;
}

const FriendPicker: React.FC<FriendPickerProps> = ({
  value,
  friends,
  user,
  onSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (friend: Friend | null) => {
    hapticFeedback();
    onSelect(friend);
    setModalVisible(false);
  };

  const me: Friend = {
    uid: user.localId,
    first_name: t('you'),
    last_name: '',
    profile_picture_url: user.profilePicture,
  };

  const data = useMemo(() => {
    return [
      {
        uid: 'all',
        first_name: t('all'),
        last_name: '',
        profile_picture_url: '',
      },
      ...friends,
      me,
    ];
  }, [friends, me]);

  const renderItem = ({item}: {item: Friend}) => {
    const isSelected =
      (value === null && item.uid === 'all') || value?.uid === item.uid;

    return (
      <TouchableOpacity
        onPress={() =>
          item.uid === 'all' ? handleSelect(null) : handleSelect(item)
        }
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: '#333',
          backgroundColor: isSelected ? '#999' : '#111',
        }}>
        {item.profile_picture_url ? (
          <Image
            source={{uri: item.profile_picture_url}}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              marginRight: 12,
            }}
          />
        ) : item.uid === 'all' ? (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#555',
              marginRight: 12,
            }}
            center>
            <Image
              assetName="ic_group"
              width={22}
              height={22}
              tintColor={Colors.grey80}
            />
          </View>
        ) : (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#555',
              marginRight: 12,
            }}
            center>
            <Text text80BL white>
              {item.first_name?.at(0)}
              {item.last_name?.at(0)}
            </Text>
          </View>
        )}
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            flex: 1,
          }}>
          {`${item.first_name} ${item.last_name}`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          backgroundColor: '#000',
          overflow: 'hidden',
        }}>
        <Text style={{color: '#fff'}}>
          {value ? `${value.first_name} ${value.last_name}` : t('all')}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              height: screenHeight * 0.5,
              backgroundColor: '#111',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflow: 'hidden',
            }}>
            <FlatList
              data={data}
              keyExtractor={item => item.uid}
              renderItem={renderItem}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default FriendPicker;
