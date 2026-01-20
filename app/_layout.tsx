import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Keyboard, Platform } from "react-native"; // Dodano Keyboard
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
    // Funkcja ukrywająca paski
    const hideSystemBars = async () => {
      if (Platform.OS === 'android') {
        try {
          // 1. Ustawienie tła na przezroczyste (żeby nie było czarnego paska pod spodem)
          await NavigationBar.setBackgroundColorAsync("transparent");
          
          // 2. Pozycjonowanie absolutne (treść wchodzi pod paski)
          await NavigationBar.setPositionAsync("absolute");
          
          // 3. Tryb "sticky immersive" - paski pojawiają się tylko przy swipe i same znikają
          await NavigationBar.setBehaviorAsync('overlay-swipe');
          
          // 4. Fizyczne ukrycie
          await NavigationBar.setVisibilityAsync("hidden");
        } catch (e) {
          console.error("Error hiding system bars:", e);
        }
      }
    };

    // Wywołanie przy starcie
    hideSystemBars();

    // --- FIX NA KLAWIATURĘ ---
    // Na Androidzie zamknięcie klawiatury często przywraca pasek nawigacji.
    // To zdarzenie wymusza ponowne ukrycie paska, gdy klawiatura zniknie.
    const keyboardListener = Keyboard.addListener('keyboardDidHide', hideSystemBars);

    return () => {
      keyboardListener.remove();
    };
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
        
        {/* StatusBar ustawiony na hidden, ale z przezroczystym tłem na wszelki wypadek */}
        <StatusBar 
            hidden={true} 
            style="light" 
            backgroundColor="transparent" 
            translucent={true} 
        />
      </GlobalProvider> 
    </GestureHandlerRootView>
  );
}