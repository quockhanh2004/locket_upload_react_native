import React from 'react';
import {View} from 'react-native-ui-lib';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import {AssetsInit} from './src/config/assets';
import {ColorsInit} from './src/config/colors';
import RootNavigation from './src/navigation/RootNavigation';
import {persistor, store} from './src/redux/store';
import MessageDialog from './src/Dialog/MessageDialog';
import CodePush from 'react-native-code-push';
import {NotificationService} from './src/services/Notification';

const App = () => {
  // useEffect(() => {
  AssetsInit();
  ColorsInit();
  // }, []);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <NotificationService />
        <GestureHandlerRootView>
          <StatusBar backgroundColor={'black'} barStyle={'light-content'} />
          <View useSafeArea flex>
            <MessageDialog />
            <RootNavigation />
          </View>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
};

const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.MANUAL, // Kiểm tra cập nhật
};
export default CodePush(codePushOptions)(App);
