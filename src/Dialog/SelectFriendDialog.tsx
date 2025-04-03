/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  Dialog,
  Colors,
  Typography,
  Avatar,
  TouchableOpacity,
  Icon,
} from 'react-native-ui-lib';
import CustomDialog from './CustomDialog';
import {FlatList} from 'react-native';
import {AppDispatch, RootState} from '../redux/store';
import {useDispatch, useSelector} from 'react-redux';
import MainButton from '../components/MainButton';
import {getFriends} from '../redux/action/getFriend.action';
import {setSelectedFriend} from '../redux/slice/friends.slice';

interface SelectFriendDialogProps {
  selected?: [];
  visible: boolean;
  onDismiss: () => void;
  onConfirm?: () => void;
}

const SelectFriendDialog: React.FC<SelectFriendDialogProps> = ({
  onDismiss,
  visible,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const {friends, isLoadFriends, selected} = useSelector(
    (state: RootState) => state.friends,
  );
  const {user} = useSelector((state: RootState) => state.user);

  const handleGetListFriend = () => {
    dispatch(
      getFriends({
        idToken: user?.idToken || '',
        idUser: user?.localId || '',
      }),
    );
  };

  const handleSelectAll = () => {
    dispatch(setSelectedFriend([]));
  };

  const handleItemSelect = (uid: string) => {
    const isSelected = selected.includes(uid);
    if (uid === 'all') {
      handleSelectAll();
    } else {
      if (isSelected) {
        dispatch(setSelectedFriend(selected.filter(id => id !== uid)));
      } else {
        dispatch(setSelectedFriend([...selected, uid]));
      }
    }
  };

  const renderItem = ({item}: any) => {
    return (
      <TouchableOpacity
        key={item.uid}
        onPress={() => handleItemSelect(item.uid)}
        center
        style={{width: 80, height: 80}}>
        <View
          center
          style={
            (selected.includes(item.uid) || selected.length === 0) && {
              borderWidth: 2,
              borderColor: Colors.primary,
              borderRadius: 99,
              padding: 2,
            }
          }>
          <Avatar source={{uri: item?.profile_picture_url}} size={30} />
        </View>
        <Text white text90 center numberOfLines={1}>
          {item.first_name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <CustomDialog
      visible={visible}
      onDismiss={onDismiss}
      panDirection={Dialog.directions.DOWN}
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
        textAlign: 'left',
        width: '100%',
      }}
      bottom
      width={'98%'}
      maxHeight={'100%'}
      containerStyle={{
        backgroundColor: 'black',
        borderWidth: 1,
        borderBottomWidth: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
        borderColor: Colors.grey20,
        gap: 4,
        padding: 12,
        borderRadius: 10,
        paddingBottom: 24,
      }}>
      <FlatList
        horizontal
        ListHeaderComponent={
          <TouchableOpacity
            onPress={handleSelectAll}
            center
            style={{width: 80, height: 80, marginBottom: 10}}>
            <View
              center
              width={50}
              height={50}
              style={[
                selected.length === 0 && {
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  borderRadius: 99,
                  padding: 2,
                },
              ]}>
              <Icon
                assetGroup="icons"
                assetName="ic_group"
                size={25}
                tintColor={Colors.white}
              />
            </View>
            <Text white text90 center numberOfLines={1}>
              Tất cả
            </Text>
          </TouchableOpacity>
        }
        data={friends}
        renderItem={renderItem}
      />
      <View row spread gap-12>
        <View>
          <MainButton
            isLoading={isLoadFriends}
            label={'Refresh friend'}
            onPress={handleGetListFriend}
            backgroundColor={Colors.blue40}
          />
        </View>
        <View flex>
          <MainButton label="Done" onPress={onDismiss} />
        </View>
      </View>
    </CustomDialog>
  );
};

export default SelectFriendDialog;
