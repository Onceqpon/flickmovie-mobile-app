import MovieCard from "@/components/MovieCard";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameResults() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const results = params.results ? JSON.parse(params.results as string) : [];

  return (
    <SafeAreaView className="flex-1 bg-primary px-4">
      <Text className="text-2xl text-white font-bold mt-6 mb-2 text-center">
        Twoje Wybory ({results.length})
      </Text>
      
      {results.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-lg mb-6">Nic nie wpadło Ci w oko.</Text>
          <TouchableOpacity 
            // POPRAWKA: as any
            onPress={() => router.replace("/game/setup" as any)} 
            className="bg-secondary px-8 py-3 rounded-xl"
          >
             <Text className="font-bold text-primary">Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ gap: 16, paddingBottom: 100, paddingTop: 20 }}
          columnWrapperStyle={{ gap: 16, justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <View className="w-[48%]">
                <MovieCard {...item} />
            </View>
          )}
        />
      )}

      <View className="absolute bottom-10 left-4 right-4">
         <Link href="/(tabs)" asChild>
            <TouchableOpacity className="w-full bg-black-100 py-4 rounded-xl items-center border border-gray-700 shadow-xl">
                <Text className="text-white font-bold">Wróć do ekranu głównego</Text>
            </TouchableOpacity>
         </Link>
      </View>
    </SafeAreaView>
  );
}