import { Stack } from "expo-router";

export default function GameLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Ekran główny (wybór trybu) */}
      <Stack.Screen name="index" /> 
      
      {/* --- SINGLEPLAYER --- */}
      <Stack.Screen 
        name="singleplayer/setup" 
        options={{ presentation: 'modal' }} // Przenosimy opcję modala tutaj
      />
      <Stack.Screen name="singleplayer/play" />
      <Stack.Screen name="singleplayer/results" />

      {/* --- MULTIPLAYER --- */}
      {/* Jeśli chcesz, by tworzenie lobby też było modalem: */}
      <Stack.Screen 
        name="multiplayer/setup" 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="multiplayer/lobby" />
      <Stack.Screen name="multiplayer/play" />
      <Stack.Screen name="multiplayer/results" />
      <Stack.Screen name="multiplayer/create" />
    </Stack>
  );
}