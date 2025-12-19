import { Stack } from "expo-router";
import './globals.css';

import GlobalProvider from "@/context/GlobalProvider";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";

// 1. IMPORTY DO OBSŁUGI MOTYWU (To naprawia błyski)
import { DarkTheme, ThemeProvider } from '@react-navigation/native';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

// 2. DEFINICJA MOTYWU
// Nadpisujemy domyślny kolor tła nawigacji (który jest biały) na Twój ciemny.
const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000C1C', // <--- KLUCZOWE: Kolor tła pod ekranami
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
          await NavigationBar.setBehaviorAsync('overlay-swipe');
          await NavigationBar.setVisibilityAsync("hidden");
          await NavigationBar.setBackgroundColorAsync("#000C1C"); 
          
        } catch (e) {
          console.log("Błąd ukrywania pasków:", e);
        }
      }
    };

    hideSystemBars();
  }, []);

  return (
    // 3. Dodano backgroundColor do GestureHandlerRootView jako ostateczny fallback
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000C1C' }}>
      <GlobalProvider>
        {/* 4. Owiń Stack w ThemeProvider */}
        <ThemeProvider value={MyDarkTheme}>
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
              <Stack.Screen
                name="profile/game-history"
                options={{
                  headerShown: false,
                }}
              />
               <Stack.Screen
                name="category/[id]"
                options={{
                  headerShown: false,
                }}
              />     
          </Stack>
        </ThemeProvider>
        
        <StatusBar hidden={true} style="light" backgroundColor="#000C1C" />

      </GlobalProvider> 
    </GestureHandlerRootView>
  );
}