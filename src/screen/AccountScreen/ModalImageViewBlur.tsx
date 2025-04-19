import {Avatar, View} from 'react-native-ui-lib';
import React from 'react';
import {Dimensions} from 'react-native';
import BlurModal from '../../Dialog/BlurModal';

interface ModalImageViewBlurProps {
  image: string;
  visible: boolean;
  onCancel: () => void;
}

const ModalImageViewBlur: React.FC<ModalImageViewBlurProps> = ({
  image,
  visible,
  onCancel,
}) => {
  return (
    <BlurModal visible={visible} onCancel={onCancel}>
      <View width={'90%'} center bg-transparent>
        <Avatar
          source={{uri: image}}
          size={Dimensions.get('window').width * 0.9}
        />
      </View>
    </BlurModal>
  );
};

export default ModalImageViewBlur;
