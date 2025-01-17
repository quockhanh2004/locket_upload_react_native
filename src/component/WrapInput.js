import React from 'react';

import {View, Text, Card} from 'react-native-ui-lib';

// import {t} from '../languages/i18n';

const WrapInput = ({
  description,
  title,
  withColon,
  error,
  children,
  required = false,
  isFocus = false,
  enableShadow,
  ...props
}) => {
  return (
    <Card {...props} centerV bg-basewhite enableShadow={enableShadow}>
      {!!title && (
        <View row bottom marginB-8>
          <Text text bold>
            {title}
            {withColon ? '：' : ''}
          </Text>
          {required && (
            <Text subText systemRed marginT-iv>
              Yêu cầu bắt buộc
            </Text>
          )}
        </View>
      )}
      {children}
      {!!error && (
        <Text subText systemRed marginL-md marginT-iv>
          {error}
        </Text>
      )}
      {!!description && (
        <Text subText subGray subLightBlack={isFocus} marginH-md marginT-iv>
          {description}
        </Text>
      )}
    </Card>
  );
};

export default WrapInput;
