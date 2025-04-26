import {View, Text, Button, Colors, LoaderScreen} from 'react-native-ui-lib';
import React from 'react';

interface MainButtonProps {
  isLoading?: boolean;
  label?: string;
  onPress?: () => void;
  backgroundColor?: string;
  lableColor?: string;
  disabled?: boolean;
  onLongPress?: () => void;
}

const MainButton: React.FC<MainButtonProps> = ({
  isLoading,
  label,
  onPress,
  backgroundColor,
  lableColor,
  disabled,
  onLongPress,
}) => {
  return (
    <Button
      label={!isLoading ? label : ''}
      backgroundColor={backgroundColor || Colors.primary}
      color={lableColor || Colors.black}
      onPress={onPress}
      onLongPress={onLongPress}
      borderRadius={8}
      disabled={disabled ? disabled : isLoading}
      delayLongPress={200}
      text70BL>
      {isLoading && (
        <View row center>
          <Text />
          <LoaderScreen color={Colors.white} size={'small'} />
        </View>
      )}
    </Button>
  );
};

export default MainButton;
