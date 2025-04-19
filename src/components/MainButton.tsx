import {View, Text, Button, Colors, LoaderScreen} from 'react-native-ui-lib';
import React from 'react';

interface MainButtonProps {
  isLoading?: boolean;
  label?: string;
  onPress?: () => void;
  backgroundColor?: string;
  lableColor?: string;
}

const MainButton: React.FC<MainButtonProps> = ({
  isLoading,
  label,
  onPress,
  backgroundColor,
  lableColor,
}) => {
  return (
    <Button
      label={!isLoading ? label : ''}
      backgroundColor={backgroundColor || Colors.primary}
      color={lableColor || Colors.black}
      onPress={onPress}
      borderRadius={8}
      disabled={isLoading}
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
