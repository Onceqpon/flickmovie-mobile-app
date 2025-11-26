import { Stack } from "expo-router";
import './globals.css';

import GlobalProvider from "@/context/GlobalProvider";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";


configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

export default function RootLayout() {
  return <GlobalProvider>
    <Stack> 
      <Stack.Screen 
        name="(tabs)" 
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
    </Stack>
  </GlobalProvider> 
}
