/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet} from 'react-native';
import {View, Dialog, Colors, Text} from 'react-native-ui-lib';
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
}) => {
  return (
    <Dialog
      visible={visible}
      onDismiss={onDismiss}
      height={height}
      panDirection={isDisable ? null : panDirection}
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
            borderRadius={4}
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
