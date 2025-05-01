/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  Dialog,
  Colors,
  Typography,
  TouchableOpacity,
} from 'react-native-ui-lib';
import CustomDialog from './CustomDialog';
import {t} from '../languages/i18n';
import {Linking} from 'react-native';
import MainButton from '../components/MainButton';

interface DonateDialogProps {}

const DonateDialog: React.FC<DonateDialogProps> = () => {
  const handleCopyBank = () => {
    Linking.openURL(
      'https://github.com/quockhanh2004/locket_upload_react_native.git',
    );
  };
  return (
    <CustomDialog
      visible={true}
      onDismiss={() => {}}
      title={'Thông báo'}
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
          {
            'Locket upload là dự án cá nhân của Phạm Ngọc Quốc Khánh. Không phải của Locket.asia'
          }
        </Text>

        <View
          style={{
            backgroundColor: Colors.grey20,
            padding: 8,
            borderRadius: 10,
          }}>
          <Text white text70BL>
            {
              'Đây là dự án hoàn toàn miễn phí. Xin đừng trả tiền cho bất kì ai để tải app!'
            }
          </Text>
          <View row gap-12 centerV>
            <Text white text70BL>
              {'Link sản phẩm chính thức: '}
            </Text>
            <TouchableOpacity
              onPress={handleCopyBank}
              style={{
                backgroundColor: Colors.grey40,
                padding: 8,
                borderRadius: 10,
              }}>
              <Text blue10 text70BL>
                {
                  'https://github.com/quockhanh2004/locket_upload_react_native.git'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <MainButton label={t('close')} onPress={() => {}} />
      </View>
    </CustomDialog>
  );
};

export default DonateDialog;
