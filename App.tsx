import './src/config';
import React, {useEffect} from 'react';
import {View} from 'react-native-ui-lib';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import RootNavigation from './src/navigation/RootNavigation';
import {persistor, store} from './src/redux/store';
import MessageDialog from './src/Dialog/MessageDialog';
import CodePush from 'react-native-code-push';
import {NotificationService} from './src/services/Notification';
import {CODEPUSH_DEPLOYMENTKEY} from './src/util/codepush';
import {clearAppCache} from './src/util/uploadImage';

const App = () => {
  useEffect(() => {
    clearAppCache();
  }, []);

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
  deploymentKey: CODEPUSH_DEPLOYMENTKEY(),
  serverUrl: 'https://code-push.quockhanh020924.id.vn',
};
export default CodePush(codePushOptions)(App);
