import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";

const FlickMatchBanner = () => {
  const router = useRouter();
  const { isLogged, loading } = useGlobalContext();

  // Jeśli trwa ładowanie statusu użytkownika, nie pokazujemy nic lub szkielet
  if (loading) return null;

  const handlePress = () => {
    if (isLogged) {
      router.push("/game");
    } else {
      router.push("/(auth)/sign-in");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="mx-4 my-6 h-36 rounded-2xl border border-secondary/30 overflow-hidden relative justify-center"
    >
      {/* Tło Gradientowe */}
      <LinearGradient
        colors={['rgba(255, 156, 1, 0.2)', 'rgba(255, 156, 1, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute w-full h-full"
      />

      {/* Dekoracyjne koła w tle */}
      <View className="absolute -right-10 -top-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />

      <View className="flex-row items-center justify-between px-6">
        {/* Lewa strona: Tekst */}
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1">
            <Text className="text-secondary font-black text-xl tracking-wider">
              FLICK
            </Text>
            <Text className="text-white font-black text-xl tracking-wider">
              MATCH
            </Text>
          </View>
          
          <Text className="text-gray-200 text-xs font-pregular mb-3">
            {isLogged 
              ? "Can't decide what to watch? Swipe and find your match!" 
              : "Discover movies with friends! Log in to start matching."}
          </Text>

          {/* Przycisk Akcji */}
          <View className={`px-4 py-2 rounded-lg self-start shadow-sm ${isLogged ? 'bg-secondary shadow-orange-500/50' : 'bg-gray-700 border border-gray-600'}`}>
             <Text className={`font-bold text-xs uppercase tracking-widest ${isLogged ? 'text-primary' : 'text-gray-200'}`}>
               {isLogged ? "Play Now" : "Login to Play"}
             </Text>
          </View>
        </View>

        {/* Prawa strona: Ikona */}
        <View className={`w-16 h-16 rounded-full justify-center items-center border shadow-lg shadow-black/40 rotate-12 ${isLogged ? 'bg-white/10 border-white/20' : 'bg-black/40 border-gray-600'}`}>
           <Image 
              source={isLogged ? icons.play : (icons.play || icons.play)} // Użyj kłódki jeśli masz (np. icons.lock), jeśli nie to play
              className="w-8 h-8"
              resizeMode="contain"
              tintColor={isLogged ? "#FF9C01" : "#9CA3AF"} // Szary dla gościa, Pomarańczowy dla zalogowanego
           />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FlickMatchBanner;