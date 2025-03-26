/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, DimensionValue} from 'react-native';
import {View, Dialog, Colors, Text} from 'react-native-ui-lib';

interface CustomDialogProps {
  visible: boolean;
  onDismiss: () => void;
  height?: number;
  panDirection?: 'up' | 'down' | 'left' | 'right';
  containerStyle?: any;
  renderPannableHeader?: (props: any) => React.ReactElement;
  pannableHeaderProps?: any;
  supportedOrientations?: (
    | 'portrait'
    | 'portrait-upside-down'
    | 'landscape'
    | 'landscape-left'
    | 'landscape-right'
  )[];
  ignoreBackgroundPress?: boolean;
  customHeader?: React.ReactNode;
  children?: React.ReactNode;
  isDisable?: boolean;
  title?: string;
  titleStyle?: any;
  bottom?: boolean;
  width?: DimensionValue;
  maxHeight?: DimensionValue;
}

const CustomDialog = ({
  visible,
  onDismiss,
  height,
  panDirection,
  containerStyle,
  renderPannableHeader,
  pannableHeaderProps,
  supportedOrientations,
  ignoreBackgroundPress,
  customHeader,
  children,
  isDisable,
  title,
  titleStyle = {},
  ...props
}: CustomDialogProps) => {
  return (
    <Dialog
      visible={visible}
      onDismiss={onDismiss}
      height={height}
      panDirection={isDisable ? undefined : panDirection}
      containerStyle={[styles.dialog, containerStyle]}
      renderPannableHeader={renderPannableHeader}
      pannableHeaderProps={pannableHeaderProps}
      supportedOrientations={supportedOrientations}
      ignoreBackgroundPress={ignoreBackgroundPress}
      {...props}>
      {customHeader ? (
        customHeader
      ) : (
        <View
          center
          style={{borderTopLeftRadius: 16, borderTopRightRadius: 16}}
          bg-basewhite>
          <View
            backgroundColor="#d9d9d9"
            width={42}
            height={4}
            style={{borderRadius: 4}}
            marginV-8
          />
          {!!title && (
            <Text marginV-12 style={titleStyle}>
              {title}
            </Text>
          )}
        </View>
      )}
      {children}
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: Colors.grey20,
  },
});

export default CustomDialog;
