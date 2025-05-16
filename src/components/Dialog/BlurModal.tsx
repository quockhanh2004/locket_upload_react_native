/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {Modal} from 'react-native-ui-lib';

interface BlurModalProps {
  visible?: boolean;
  onCancel?: () => void;
  scaleAnimation?: Animated.Value;
  onCloseModal?: () => void;
  children: React.ReactNode;
}

const BlurModal: React.FC<BlurModalProps> = ({
  visible = false,
  onCancel,
  scaleAnimation,
  onCloseModal = () => {},
  children,
  ...props
}) => {
  // visible sẽ là trạng thái ẩn hiện của modal nhưng chưa là tuyệt đối
  // localVisible là trạng thái ẩn modal tuyệt đối
  // oncancel sẽ khíến component gọi BlurModal set visible là false
  // sau khi visible là false thì thực hiện animation thu nhỏ và ẩn modal đi
  // đợi đến khi animation thực hiện xong thì sẽ trả về callback onCloseModal - tức là modal đã thực sự ẩn
  // callback này dùng để thực hiện các event khi buộc phải chờ BlurModal ẩn hoàn toàn mới thực hiện được
  const [localVisible, setlocalVisible] = useState(false);

  const localScaleAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setlocalVisible(true);
      Animated.spring(localScaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(localScaleAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setlocalVisible(false);
        onCloseModal();
      });
    }
  }, [visible]);

  return (
    <Modal
      visible={localVisible}
      statusBarTranslucent
      overlayBackgroundColor="transparent"
      onDismiss={onCancel}
      {...props}>
      <Pressable style={{flex: 1}} onPress={onCancel}>
        <BlurView
          style={[StyleSheet.absoluteFill]}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="black">
          <Animated.View
            style={[
              {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              },
              {
                transform: [{scale: scaleAnimation || localScaleAnimation}],
              },
            ]}>
            <Pressable onPress={null}>{children}</Pressable>
          </Animated.View>
        </BlurView>
      </Pressable>
    </Modal>
  );
};

export default BlurModal;
