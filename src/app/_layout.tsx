import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/providers/AuthProvider';
// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Map your chosen font family names to the local asset files
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../../assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
  });

  // Callback to hide the splash screen once the root view renders
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Keep returning null until fonts are loaded or an error is caught
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <View style={{ flex: 1 }} onLayout={onLayoutRootView}><AuthProvider><Stack screenOptions={{ headerShown: false }} /></AuthProvider></View>;
}
