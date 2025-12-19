import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from "nativewind";

import MovieCard from '@/components/WatchlistMovieCard';
import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getUserWatchlist, getUserWatchlistSeries } from '@/services/appwriteapi';

cssInterop(LinearGradient, {
  className: "style",
});

const Watchlist = () => {
  const { user } = useGlobalContext();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'movies' | 'series'>('movies');

  const fetchWatchlist = async () => {
    if (!user) return;
    try {
      let data;
      if (filter === 'movies') {
        data = await getUserWatchlist(user.$id);
      } else {
        data = await getUserWatchlistSeries(user.$id);
      }
      setWatchlist(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchWatchlist();
    }, [user, filter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchWatchlist();
  };

  // --- POPRAWIONA FUNKCJA NAWIGACJI ---
  // Sprawdza aktualny filtr i przekierowuje do odpowiedniego folderu
  const handleCardPress = (id: number) => {
    if (filter === 'movies') {
      router.push(`/movies/${id}`);
    } else {
      router.push(`/tvseries/${id}`);
    }
  };

  return (
    <View className="flex-1 bg-[#1E1E2D]">
      
      {/* TŁO GRADIENTOWE */}
      <LinearGradient
        colors={["#000C1C", "#161622", "#1E1E2D"]}
        className="absolute w-full h-full"
      />

      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}> 
        <View className="px-4 my-6 flex-1 relative">
          
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="mr-4 bg-black-100 p-2 rounded-full border border-black-200"
              activeOpacity={0.7}
            >
              <Image 
                source={icons.left_arrow || icons.angle_left} 
                className="w-5 h-5" 
                resizeMode="contain" 
                tintColor="#fff"
              />
            </TouchableOpacity>
            <Text className="text-2xl text-white font-bold">My Watchlist</Text>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#FF9C01" className="mt-10" />
          ) : (
            <FlatList
              data={watchlist}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <MovieCard 
                  id={item.id} 
                  // ZABEZPIECZENIE: Używamy title lub name (dla seriali)
                  title={item.title || item.name} 
                  poster_path={item.poster_path} 
                  vote_average={item.vote_average} 
                  // WAŻNE: Przekazujemy funkcję nawigacji
                  onPress={() => handleCardPress(item.id)}
                />
              )}
              numColumns={3}
              // gap działa dobrze, upewnij się że WatchlistMovieCard ma elastyczną szerokość (np. width: '31%')
              columnWrapperStyle={{ gap: 10, justifyContent: 'flex-start', marginBottom: 15 }} 
              contentContainerStyle={{ paddingBottom: 100 }} 
              ListEmptyComponent={() => (
                <View className="flex-1 justify-center items-center mt-20">
                  <Image 
                      source={icons.bookmark} 
                      className="w-16 h-16 mb-4 opacity-20" 
                      tintColor="white" 
                      resizeMode="contain"
                  />
                  <Text className="text-gray-100 text-lg font-psemibold">Your list is empty</Text>
                  <Text className="text-gray-500 text-sm mt-2 font-pregular text-center max-w-[200px]">
                      {filter === 'movies' ? "Find movies and bookmark them!" : "Find TV series and bookmark them!"}
                  </Text>
                </View>
              )}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            />
          )}

          {/* Floating Filter Switcher */}
          <View className="absolute bottom-5 left-4 right-4 bg-black-100/90 backdrop-blur-md rounded-full p-2 flex-row border border-black-200 shadow-lg shadow-black/50">
              <TouchableOpacity 
                  onPress={() => setFilter('movies')}
                  className={`flex-1 py-3 rounded-full items-center justify-center ${filter === 'movies' ? 'bg-secondary' : 'bg-transparent'}`}
                  activeOpacity={0.7}
              >
                  <Text className={`font-bold text-base ${filter === 'movies' ? 'text-primary' : 'text-gray-400'}`}>Movies</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                  onPress={() => setFilter('series')}
                  className={`flex-1 py-3 rounded-full items-center justify-center ${filter === 'series' ? 'bg-secondary' : 'bg-transparent'}`}
                  activeOpacity={0.7}
              >
                  <Text className={`font-bold text-base ${filter === 'series' ? 'text-primary' : 'text-gray-400'}`}>TV Series</Text>
              </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
};

export default Watchlist;