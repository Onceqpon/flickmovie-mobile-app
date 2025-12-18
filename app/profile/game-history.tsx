import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { cssInterop } from "nativewind";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons'; // Upewnij się, że masz te ikony
import { useGlobalContext } from '@/context/GlobalProvider';
import { deleteGameHistoryEntry, getUserGameHistory } from '@/services/appwriteapi';

// Konfiguracja stylów dla Gradientu (NativeWind)
cssInterop(LinearGradient, {
  className: "style",
});

const GameHistory = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pobieranie historii przy załadowaniu
  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const data = await getUserGameHistory(user.$id);
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Obsługa usuwania sesji
  const handleDelete = (id: string) => {
    Alert.alert(
        "Delete Session",
        "Are you sure you want to delete this history entry? Saved movies will remain in your lists.",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        // Optimistic update: usuwamy z UI od razu
                        setHistory(prev => prev.filter(item => item.$id !== id));
                        await deleteGameHistoryEntry(id);
                    } catch (error) {
                        Alert.alert("Error", "Could not delete entry");
                        fetchHistory(); // Przywróć w razie błędu
                    }
                } 
            }
        ]
    );
  };

  // Renderowanie pojedynczej sesji gry
  const renderItem = ({ item }: { item: any }) => {
    const date = new Date(item.$createdAt).toLocaleDateString();
    const time = new Date(item.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View className="bg-black-100 mb-6 rounded-2xl border border-black-200 shadow-sm shadow-black/40 overflow-hidden">
        
        {/* --- Nagłówek Karty --- */}
        <View className="flex-row justify-between items-center p-4 bg-black-200/40 border-b border-black-200">
            <View className="flex-row items-center">
                <View className="bg-secondary/20 p-2 rounded-full mr-3">
                     {/* Użyj icons.play, icons.check lub innej pasującej ikony */}
                    <Image 
                        source={icons.play || icons.bookmark} 
                        className="w-4 h-4" 
                        resizeMode="contain" 
                        tintColor="#FF9C01" 
                    />
                </View>
                <View>
                    <Text className="text-white font-psemibold text-lg">Game Session</Text>
                    <Text className="text-gray-400 text-xs font-pregular">
                        {date} at {time} • {item.items.length} matches
                    </Text>
                </View>
            </View>
            
            <TouchableOpacity 
                onPress={() => handleDelete(item.$id)}
                className="p-2 bg-red-500/10 rounded-full active:bg-red-500/30"
            >
                <Image 
                    source={icons.close || icons.trash} // Ikona kosza lub krzyżyka
                    className="w-4 h-4" 
                    tintColor="#FF4444" 
                    resizeMode="contain" 
                />
            </TouchableOpacity>
        </View>

        {/* --- Lista Filmów (Pozioma) --- */}
        <View className="p-4">
            {item.items.length === 0 ? (
                <Text className="text-gray-500 italic text-sm text-center py-2">No movies saved in this session.</Text>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {item.items.map((movie: any, index: number) => (
                        <TouchableOpacity 
                            key={`${item.$id}-${movie.id}-${index}`}
                            activeOpacity={0.7}
                            onPress={() => {
                                // Sprawdzenie czy to film czy serial (na podstawie pól TMDB)
                                if (movie.title) {
                                    router.push(`/movies/${movie.id}`);
                                } else {
                                    router.push(`/tvseries/${movie.id}`);
                                }
                            }}
                            className="mr-3 relative group"
                        >
                            <Image 
                                source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
                                className="w-[90px] h-[135px] rounded-xl bg-gray-800 border border-black-200"
                                resizeMode="cover"
                            />
                            {/* Opcjonalny Badge oceny */}
                            <View className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-xs backdrop-blur-sm">
                                <Text className="text-secondary text-[8px] font-bold">
                                    ★ {movie.vote_average?.toFixed(1)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
      </View>
    );
  };

  return (
    // Struktura zapobiegająca białej linii na dole
    <View className="flex-1 bg-[#1E1E2D]">
     <LinearGradient
                colors={["#000C1C", "#161622", "#1E1E2D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="absolute w-full h-full"
              />

      <SafeAreaView className="flex-1">
        {/* --- Header Ekranu --- */}
        <View className="flex-row items-center px-4 my-6">
            <TouchableOpacity 
                onPress={() => router.back()} 
                className="bg-black-100 p-2 rounded-full mr-4 border border-black-200"
            >
                <Image 
                    source={icons.left_arrow || icons.angle_left} 
                    className="w-5 h-5" 
                    resizeMode="contain" 
                    tintColor="white" 
                />
            </TouchableOpacity>
            <Text className="text-2xl font-psemibold text-white">Game History</Text>
        </View>

        {/* --- Zawartość --- */}
        {loading ? (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#FF9C01" />
            </View>
        ) : (
            <FlatList 
                data={history}
                keyExtractor={(item) => item.$id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View className="flex-1 justify-center items-center mt-20 px-4">
                         <View className="bg-black-100 p-6 rounded-full mb-6 border-2 border-dashed border-gray-700">
                             <Image 
                                 source={icons.play || icons.bookmark} 
                                 className="w-12 h-12 opacity-50" 
                                 tintColor="white" 
                                 resizeMode="contain"
                             />
                         </View>
                        <Text className="text-white text-xl font-psemibold mb-2">No history yet</Text>
                        <Text className="text-gray-100 text-center font-pregular max-w-[250px] leading-6">
                            Play the matching game to discover new movies and build your history!
                        </Text>
                    </View>
                )}
            />
        )}
      </SafeAreaView>
    </View>
  );
};

export default GameHistory;