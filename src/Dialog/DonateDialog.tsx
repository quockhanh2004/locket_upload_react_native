/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Dialog,
  Colors,
  Typography,
  TouchableOpacity,
  Icon,
} from 'react-native-ui-lib';
import Clipboard from '@react-native-clipboard/clipboard';
import CustomDialog from './CustomDialog';
import {t} from '../languages/i18n';
import {ToastAndroid} from 'react-native';
import MainButton from '../components/MainButton';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {hapticFeedback} from '../util/haptic';

const DonateDialog: React.FC = () => {
  const {showDonate} = useSelector((state: RootState) => state.setting);
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [visible, setVisible] = useState(showDonate);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopyBank = () => {
    hapticFeedback();
    Clipboard.setString('0382914192');
    ToastAndroid.show(t('copyed'), ToastAndroid.SHORT);
  };

  const handleClose = () => {
    // if (disableButton) {
    //   console.log('disableButton');

    //   setVisible(false);
    //   setTimeout(() => {
    //     setVisible(true);
    //     setCountdown(5);
    //   }, 0);
    // } else {
    //   setVisible(false);
    // }
    setVisible(false);
  };

  // useEffect(() => {
  //   if (countdown === 0) {
  //     setDisableButton(false);
  //     return;
  //   }

  //   intervalRef.current = setInterval(() => {
  //     setCountdown(prev => {
  //       if (prev <= 1) {
  //         clearInterval(intervalRef.current!);
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //     }
  //   };
  // }, [countdown]);

  return (
    <CustomDialog
      visible={visible}
      onDismiss={handleClose}
      title={t('thank_for_use_my_app')}
      panDirection={Dialog.directions.DOWN}
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
        borderRadius: 10,
        paddingBottom: 24,
      }}
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
      }}>
      <View paddingH-20 gap-8>
        <Text white text70BL>
          {t('donate')}
        </Text>

        <View
          style={{
            backgroundColor: Colors.grey20,
            padding: 8,
            borderRadius: 10,
          }}>
          <Text white text70BL>
            Bank: MBBank - PHAM NGOC QUOC KHANH
          </Text>
          <View row gap-12 centerV>
            <Text white text70BL>
              STK: 0382914192
            </Text>
            <TouchableOpacity
              onPress={handleCopyBank}
              style={{
                backgroundColor: Colors.grey40,
                padding: 8,
                borderRadius: 10,
              }}>
              <Icon assetName="ic_copy" size={16} tintColor={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <MainButton
          label={
            disableButton ? `${t('can_close_after')} ${countdown}` : t('close')
          }
          disabled={disableButton}
          onPress={() => setVisible(false)}
        />
      </View>
    </CustomDialog>
  );
};

export default DonateDialog;
