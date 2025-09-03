import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-netinfo/netinfo';

import { store, persistor } from './src/store';
import { theme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/components/LoadingScreen';
import { checkNetworkConnection } from './src/utils/networkUtils';
import { initializeApp } from './src/utils/appUtils';

const App: React.FC = () => {
  useEffect(() => {
    initializeApp();
    checkNetworkConnection();
    
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network state:', state);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar
              barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
              backgroundColor={theme.colors.primary}
            />
            <AppNavigator />
            <Toast />
          </NavigationContainer>
        </PaperProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;

