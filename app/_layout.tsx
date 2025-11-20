import { Stack } from "expo-router";
import './globals.css';

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";


configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

export default function RootLayout() {
  return <Stack> 
    <Stack.Screen 
      name="(tabs)" 
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
  </Stack>;
}
