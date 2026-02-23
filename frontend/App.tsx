import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameSessionProvider } from './src/context/GameSessionContext';
import { MissionCameraScreen } from './src/screens/MissionCameraScreen';
import { NFCUnlockScreen } from './src/screens/NFCUnlockScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { RoleSelectScreen } from './src/screens/RoleSelectScreen';
import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <GameSessionProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="RoleSelect"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#050A1A' },
            }}
          >
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
            <Stack.Screen name="MissionCamera" component={MissionCameraScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="NFCUnlock" component={NFCUnlockScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GameSessionProvider>
    </SafeAreaProvider>
  );
}
