import MovieCard from "@/components/MovieCard";
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Używamy tylko do przycisku 'Try Again', usunięto z tła dolnego
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameResults() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const results = useMemo(() => {
    try {
      return params.results ? JSON.parse(params.results as string) : [];
    } catch (e) {
      console.error("Error parsing results:", e);
      return [];
    }
  }, [params.results]);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* --- HEADER --- */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-gray-400 text-sm font-medium uppercase tracking-widest text-center">
          Session Summary
        </Text>
        <Text className="text-3xl text-white font-black mt-1 text-center">
          Your Picks
          <Text className="text-secondary">.</Text>
        </Text>
        {results.length > 0 && (
          <View className="flex-row justify-center items-center mt-2 space-x-2">
            <MaterialIcons name="local-movies" size={16} color="#FF9C01" />
            <Text className="text-gray-300 font-medium">
              Saved {results.length} {results.length === 1 ? 'title' : 'titles'}
            </Text>
          </View>
        )}
      </View>

      {/* --- MAIN CONTENT --- */}
      <View className="flex-1 px-4 mt-4">
        {results.length === 0 ? (
          // EMPTY STATE
          <View className="flex-1 justify-center items-center opacity-80">
            <View className="bg-black-100 p-8 rounded-full mb-6 border-2 border-dashed border-gray-700">
              <Feather name="frown" size={64} color="#666" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">It s empty here...</Text>
            <Text className="text-gray-400 text-center mb-8 px-10 leading-6">
              It looks like no movie stole your heart this time.
            </Text>
            
            <TouchableOpacity 
              onPress={() => router.replace("/game/setup" as any)}
              className="w-full"
            >
              <LinearGradient
                colors={['#FF9C01', '#FF3C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-8 py-4 rounded-xl flex-row justify-center items-center"
              >
                 <Feather name="refresh-cw" size={20} color="white" style={{marginRight: 10}} />
                 <Text className="text-white font-bold text-lg">Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          // RESULTS LIST
          <FlatList
            data={results}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140, paddingTop: 10 }}
            columnWrapperStyle={{ gap: 12, justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <View className="w-[48%] mb-4">
                 {/* SHARP CORNERS (no rounded-2xl) */}
                 <View className="overflow-hidden shadow-sm shadow-black bg-black-100/50">
                    <MovieCard {...item} />
                 </View>
              </View>
            )}
          />
        )}
      </View>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <View className="absolute bottom-0 left-0 right-0 p-6 pt-4 bg-primary"> 
        {/* ZMIANA: Usunięto LinearGradient (cień) i dodano bg-primary, żeby tło pod przyciskiem było jednolite */}
        
        <Link href="/(tabs)" asChild>
          <TouchableOpacity className="shadow-lg shadow-black/50">
             <View className="bg-secondary rounded-2xl py-4 px-6 flex-row items-center justify-center space-x-3">
                <Feather name="home" size={20} color="#161622" />
                <Text className="text-primary font-bold text-lg ml-2">Back to Home</Text>
             </View>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}