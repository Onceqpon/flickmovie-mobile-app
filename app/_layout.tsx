import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

import GlobalProvider from "@/context/GlobalProvider";
import './globals.css';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000C1C', 
    card: '#000C1C',
    text: '#ffffff',
    border: '#232533',
  },
};
 
export default function RootLayout() {

  useEffect(() => {
    const hideSystemBars = async () => {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setPositionAsync("absolute");
          await NavigationBar.setVisibilityAsync("hidden");
        } catch (e) {
          console.error("Error hiding system bars:", e);
        }
      }
    };

    hideSystemBars();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000C1C' }}>
      <GlobalProvider>
        <ThemeProvider value={MyDarkTheme}>
          <Stack screenOptions={{ headerShown: false }}> 
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="game" />
            <Stack.Screen name="movies/[id]" />
            <Stack.Screen name="tvseries/[id]" />
            <Stack.Screen name="search/search" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="profile/change-password" />
            <Stack.Screen name="profile/watchlist" />
            <Stack.Screen name="profile/ratings" />
            <Stack.Screen name="profile/lists" />
            <Stack.Screen name="profile/lists/[id]" />
            <Stack.Screen name="profile/game-history" />
            <Stack.Screen name="category/[id]" />
          </Stack>
        </ThemeProvider>
        
        <StatusBar hidden={true} style="light" backgroundColor="#000C1C" />
      </GlobalProvider> 
    </GestureHandlerRootView>
  );
}