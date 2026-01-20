import { Stack } from "expo-router";

export default function GameLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
      
      <Stack.Screen 
        name="singleplayer/setup" 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen name="singleplayer/play" />
      <Stack.Screen name="singleplayer/bracket" />
      <Stack.Screen name="singleplayer/results" />

      <Stack.Screen 
        name="multiplayer/setup" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="multiplayer/lobby" />
      <Stack.Screen name="multiplayer/play" />
      <Stack.Screen name="multiplayer/results" />
      <Stack.Screen name="multiplayer/create" />
      <Stack.Screen name="multiplayer/join" />
    </Stack>
  );
}