import { icons } from "@/constants/icons";
import { GENRES, WATCH_PROVIDERS } from "@/services/tmdbapi";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameSetup() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);

  const toggleSelection = (id: number, list: number[], setList: React.Dispatch<React.SetStateAction<number[]>>) => {
    if (list.includes(id)) {
      setList(list.filter((item) => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleStartGame = () => {
    router.push({
      pathname: "/game/play",
      params: {
        genres: JSON.stringify(selectedGenres),
        providers: JSON.stringify(selectedProviders),
      },
    } as any); 
  };

  return (
    <SafeAreaView className="flex-1 bg-primary px-4">
      <View className="flex-row items-center mt-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2">
           {/* POPRAWKA: icons.left_arrow zamiast arrowleft */}
           <Image source={icons.left_arrow} className="w-6 h-6" tintColor="white" />
        </TouchableOpacity>
        <Text className="text-2xl text-white font-bold">Tryb Solo</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-gray-400 mb-6">
          Zaznacz tyle opcji, ile chcesz. Algorytm dobierze filmy pasujące do Twoich wyborów.
        </Text>

        <Text className="text-lg text-secondary font-semibold mb-3">
          1. Posiadane platformy VOD
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {Object.entries(WATCH_PROVIDERS).map(([key, value]) => {
            const id = value as number; 
            const isSelected = selectedProviders.includes(id);
            return (
              <TouchableOpacity
                key={id}
                onPress={() => toggleSelection(id, selectedProviders, setSelectedProviders)}
                className={`px-4 py-3 rounded-xl border ${
                  isSelected
                    ? "bg-secondary border-secondary"
                    : "bg-black-100 border-gray-700"
                }`}
              >
                <Text className={`font-medium ${isSelected ? "text-primary" : "text-gray-300"}`}>
                  {key.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-lg text-secondary font-semibold mb-3">
          2. Preferowane gatunki
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-10">
          {GENRES.map((genre) => {
             const isSelected = selectedGenres.includes(genre.id);
             return (
              <TouchableOpacity
                key={genre.id}
                onPress={() => toggleSelection(genre.id, selectedGenres, setSelectedGenres)}
                className={`px-4 py-2 rounded-full border ${
                  isSelected
                    ? "bg-secondary border-secondary"
                    : "bg-transparent border-gray-600"
                }`}
              >
                <Text className={isSelected ? "text-primary font-semibold" : "text-gray-400"}>
                  {genre.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View className="mb-4">
        <TouchableOpacity
          onPress={handleStartGame}
          className={`w-full py-4 rounded-xl items-center ${
             (selectedGenres.length > 0 || selectedProviders.length > 0) 
             ? "bg-secondary" 
             : "bg-gray-700"
          }`}
          disabled={selectedGenres.length === 0 && selectedProviders.length === 0}
        >
          <Text className={`font-bold text-lg ${
             (selectedGenres.length > 0 || selectedProviders.length > 0) ? "text-primary" : "text-gray-400"
          }`}>
            Rozpocznij Grę
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}