import React from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext, useAuthState } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.debug = () => {};
}

LogBox.ignoreLogs(['AsyncStorage has been extracted']);

export default function App() {
  const authState = useAuthState();

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthContext.Provider value={authState}>
          <AppNavigator />
          <OfflineBanner />
          <StatusBar style="auto" />
        </AuthContext.Provider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
