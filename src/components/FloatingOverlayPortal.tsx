import React from 'react';
import {View, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {Portal} from 'react-native-portalize';

interface FloatingOverlayPortalProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const FloatingOverlayPortal: React.FC<FloatingOverlayPortalProps> = ({
  children,
  style,
}) => {
  return (
    <Portal>
      <View style={[styles.overlay, style]}>{children}</View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'box-none', // Để touch xuyên qua nếu cần
    zIndex: 9999,
  },
});

export default FloatingOverlayPortal;
