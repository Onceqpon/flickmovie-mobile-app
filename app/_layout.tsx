import { Stack } from "expo-router";
import './globals.css';

import GlobalProvider from "@/context/GlobalProvider";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

import { GestureHandlerRootView } from "react-native-gesture-handler";

// NOWE: Importy do obsługi pasków systemowych
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

export default function RootLayout() {

  useEffect(() => {
    const hideSystemBars = async () => {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setVisibilityAsync("hidden");
        } catch (e) {
          console.log("Błąd ukrywania pasków:", e);
        }
      }
    };

    hideSystemBars();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobalProvider>
        <Stack> 
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="game" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="(auth)"
            options={{
              headerShown: false 
            }} 
          />
          <Stack.Screen
            name="movies/[id]"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="tvseries/[id]"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="search/search"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
              name="profile/edit"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/change-password"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/watchlist"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/ratings"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/lists"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/lists/[id]"
              options={{
                headerShown: false,
              }}
            />   
        </Stack>
        <StatusBar hidden={true} style="light" backgroundColor="#161622" />

      </GlobalProvider> 
    </GestureHandlerRootView>
  );
}