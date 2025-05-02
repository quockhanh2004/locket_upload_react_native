/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  Dialog,
  Typography,
  Colors,
  Avatar,
} from 'react-native-ui-lib';
import CustomDialog from './CustomDialog';

interface Reaction {
  uid: string;
  name?: string;
  image?: string;
  reaction?: string;
}

interface ReactionDialogProps {
  visible: boolean;
  onDismiss: () => void;
  reaction: Reaction[];
}

const ReactionDialog: React.FC<ReactionDialogProps> = ({
  visible,
  onDismiss,
  reaction,
}) => {
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
      containerStyle={{
        backgroundColor: 'black',
        borderWidth: 1,
        borderBottomWidth: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
        borderColor: Colors.grey20,
        gap: 4,
        padding: 12,
        paddingBottom: 24,
        borderRadius: 10,
        overflow: 'hidden',
      }}>
      {reaction.map((item, index) => (
        <View key={index} row centerV spread width={'100%'} marginT-12>
          <View row center>
            <Avatar
              source={{uri: item.image}}
              size={40}
              containerStyle={{marginRight: 8}}
            />
            <Text white text70BL>
              {item.name}
            </Text>
          </View>
          <Text
            style={{
              color: Colors.white,
              ...Typography.text60BL,
              textAlign: 'left',
            }}>
            {item.reaction}
          </Text>
        </View>
      ))}
    </CustomDialog>
  );
};

export default ReactionDialog;
