import {View, Text, Button, Colors, LoaderScreen} from 'react-native-ui-lib';
import React from 'react';

const MainButton = ({isLoading, label, onPress}) => {
  return (
    <Button
      label={!isLoading ? label : ''}
      backgroundColor={Colors.primary}
      black
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
