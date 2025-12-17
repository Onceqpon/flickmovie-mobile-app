
import { Stack } from "expo-router";

export default function GameLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="setup" 
        options={{ presentation: 'modal' }} // Tylko unikalna opcja
      />
      <Stack.Screen name="play" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
