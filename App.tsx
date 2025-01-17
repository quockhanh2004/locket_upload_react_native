import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AssetsInit} from './src/config/assets';
import {ColorsInit} from './src/config/colors';
import RootNavigation from './src/navigation/RootNavigation';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {persistor, store} from './src/redux/store';
import {PersistGate} from 'redux-persist/integration/react';
import {View} from 'react-native-ui-lib';
import MessageDialog from './src/Dialog/MessageDialog';

const App = () => {
  // useEffect(() => {
  AssetsInit();
  ColorsInit();
  // }, []);
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
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

export default App;
