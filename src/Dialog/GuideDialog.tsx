/* eslint-disable react-native/no-inline-styles */
import {
  Checkbox,
  Colors,
  Dialog,
  Image,
  Text,
  Typography,
  View,
} from 'react-native-ui-lib';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {clearMessage} from '../redux/slice/message.slice';
import CustomDialog from './CustomDialog';
import {AppDispatch} from '../redux/store';
import Video from 'react-native-video';
import MainButton from '../components/MainButton';
import {t} from '../languages/i18n';

interface GuideDialogProps {
  visible: boolean;
  label?: string;
  decription?: string;
  onDismiss?: () => void;
  guideAssetsVideo?: any;
  guideAssetsImage?: any;
}

const GuideDialog: React.FC<GuideDialogProps> = ({
  visible,
  label,
  decription,
  onDismiss,
  guideAssetsVideo,
  guideAssetsImage,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [notShowAgain, setNotShowAgain] = useState(false);
  const [localVisible, setlocalVisible] = useState(visible);

  const handlePress = () => {
    if (notShowAgain && onDismiss) {
      setlocalVisible(false);
      onDismiss();
    } else {
      setlocalVisible(false);
    }
  };

  const handleClearMessage = () => {
    dispatch(clearMessage());
  };
  return (
    <CustomDialog
      visible={localVisible}
      onDismiss={handleClearMessage}
      panDirection={Dialog.directions.DOWN}
      bottom
      width={'98%'}
      maxHeight={'100%'}
      title={label}
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
        textAlign: 'left',
        width: '100%',
      }}
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
      {decription && (
        <Text text text80BL padding-8>
          {decription}
        </Text>
      )}
      <View margin-12 bg-grey20 style={{borderRadius: 10}}>
        {guideAssetsVideo && (
          <Video
            source={guideAssetsVideo}
            style={{
              width: '100%',
              height: 300,
            }}
            repeat={true}
          />
        )}
        {guideAssetsImage && (
          <Image
            source={guideAssetsImage}
            style={{
              width: '100%',
              height: 300,
            }}
          />
        )}
      </View>
      <View gap-8>
        <Checkbox
          label={t('not_show_again')}
          labelStyle={{color: Colors.white}}
          color={Colors.primary}
          value={notShowAgain}
          onValueChange={setNotShowAgain}
        />
        <MainButton label={t('understood')} onPress={handlePress} />
      </View>
    </CustomDialog>
  );
};

export default GuideDialog;
