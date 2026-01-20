import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import { createGame } from "@/services/gameService";

cssInterop(LinearGradient, { className: "style" });

const MultiplayerSetup = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  
  const [rounds, setRounds] = useState("5");
  const [genresCount, setGenresCount] = useState("2");
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const game = await createGame(
          user.$id, 
          user.name, 
          (user.prefs as any).avatar, 
          { 
            genresCount: parseInt(genresCount) || 2,
            contentType: 'movie',
            providers: []
          }
      );
      
      router.replace({ pathname: "/game/multiplayer/lobby" as any, params: { gameId: game.$id } });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1E1E2D]">
      <LinearGradient colors={["#000C1C", "#161622", "#1E1E2D"]} className="absolute w-full h-full" />
      <SafeAreaView className="flex-1 p-6">
        
        <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => router.back()} className="p-2 bg-black/20 rounded-full border border-white/10">
                <Image source={icons.left_arrow} className="w-5 h-5" tintColor="white" resizeMode="contain" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white ml-4">Create Multiplayer</Text>
        </View>

        <View className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-6">
            <View>
                <Text className="text-gray-300 mb-2 font-semibold">Number of Rounds</Text>
                <TextInput
                    value={rounds}
                    onChangeText={setRounds}
                    keyboardType="numeric"
                    className="bg-black/40 text-white p-4 rounded-xl border border-white/10 font-bold text-lg"
                />
            </View>

            <View>
                <Text className="text-gray-300 mb-2 font-semibold">Genres per Player</Text>
                <TextInput
                    value={genresCount}
                    onChangeText={setGenresCount}
                    keyboardType="numeric"
                    className="bg-black/40 text-white p-4 rounded-xl border border-white/10 font-bold text-lg"
                />
            </View>

            <TouchableOpacity
                onPress={handleCreateGame}
                disabled={loading}
                className="bg-secondary p-4 rounded-xl items-center mt-4 active:opacity-80"
            >
                {loading ? <ActivityIndicator color="#000" /> : (
                    <Text className="text-primary font-black text-lg uppercase tracking-widest">Create Lobby</Text>
                )}
            </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
};

export default MultiplayerSetup;