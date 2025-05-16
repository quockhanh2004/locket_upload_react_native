/* eslint-disable react-native/no-inline-styles */
import React, {useState, useMemo} from 'react';
import {Modal, FlatList, Dimensions, StyleSheet} from 'react-native';
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  Colors,
  BorderRadiuses,
} from 'react-native-ui-lib';
import {Friend} from '../../models/friend.model';
import {User} from '../../models/user.model';
import {t} from '../../languages/i18n';
import {hapticFeedback} from '../../util/haptic';

const screenHeight = Dimensions.get('window').height;

interface FriendPickerProps {
  value?: Friend | null;
  friends: {
    [key: string]: Friend;
  };
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

  const me: Friend = useMemo(() => {
    return {
      uid: user.localId,
      first_name: t('you'),
      last_name: '',
      profile_picture_url: user.photoUrl,
    };
  }, [user]);

  const data = useMemo(() => {
    return {
      all: {
        uid: 'all',
        first_name: t('all'),
        last_name: '',
        profile_picture_url: '',
      },
      ...friends,
      [me.uid]: me,
    };
  }, [friends, me]);

  const renderItem = ({item}: {item: Friend}) => {
    const isSelected =
      (value === null && item.uid === 'all') || value?.uid === item.uid;

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item.uid === 'all' ? null : item)}
        style={[styles.itemContainer, isSelected && styles.selectedItem]}>
        {item.profile_picture_url ? (
          <Image
            source={{uri: item.profile_picture_url}}
            style={styles.avatar}
          />
        ) : item.uid === 'all' ? (
          <View style={styles.placeholderAvatar} center>
            <Image
              assetName="ic_group"
              width={22}
              height={22}
              tintColor={Colors.grey80}
            />
          </View>
        ) : (
          <View style={styles.placeholderAvatar} center>
            <Text text80BL white>
              {item.first_name?.at(0)}
              {item.last_name?.at(0)}
            </Text>
          </View>
        )}
        <Text
          style={{
            fontSize: 14,
            lineHeight: 30,
          }}
          center
          white>
          {`${item.first_name} ${item.last_name}`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        center
        style={styles.pickerButton}>
        <Text white>
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
          style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <FlatList
              data={Object.values(data)}
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

const styles = StyleSheet.create({
  pickerButton: {
    paddingHorizontal: 10,
    minHeight: 36,
    borderWidth: 1,
    borderColor: Colors.grey50,
    borderRadius: BorderRadiuses.br20,
    backgroundColor: Colors.black,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey30,
    backgroundColor: Colors.grey10,
  },
  selectedItem: {
    backgroundColor: Colors.grey40,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  placeholderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.grey30,
    marginRight: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: screenHeight * 0.5,
    backgroundColor: Colors.grey10,
    borderTopLeftRadius: BorderRadiuses.br40,
    borderTopRightRadius: BorderRadiuses.br40,
    overflow: 'hidden',
  },
});
