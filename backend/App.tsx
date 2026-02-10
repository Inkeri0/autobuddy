import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext, useAuthState } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const authState = useAuthState();

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={authState}>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
