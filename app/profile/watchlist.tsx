import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MovieCard from '@/components/WatchlistMovieCard';
import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getUserWatchlist, getUserWatchlistSeries } from '@/services/appwriteapi';

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

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="px-4 my-6 flex-1 relative">
        
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Image 
              source={icons.left_arrow} 
              className="w-6 h-6" 
              resizeMode="contain" 
              style={{ tintColor: '#fff' }}
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
                title={item.title} 
                poster_path={item.poster_path} 
                vote_average={item.vote_average} 
              />
            )}
            numColumns={3}
            columnWrapperStyle={{ gap: 5, justifyContent: 'flex-start', marginBottom: 15 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center mt-20">
                <Text className="text-gray-100 text-lg">Your list is empty</Text>
                <Text className="text-gray-500 text-sm mt-2">
                   {filter === 'movies' ? "Find movies and bookmark them!" : "Find TV series and bookmark them!"}
                </Text>
              </View>
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          />
        )}

        <View className="absolute bottom-5 left-4 right-4 bg-black-100 rounded-full p-2 flex-row border border-black-200">
            <TouchableOpacity 
                onPress={() => setFilter('movies')}
                className={`flex-1 py-3 rounded-full items-center justify-center ${filter === 'movies' ? 'bg-secondary' : 'bg-transparent'}`}
            >
                <Text className={`font-bold ${filter === 'movies' ? 'text-primary' : 'text-gray-400'}`}>Movies</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => setFilter('series')}
                className={`flex-1 py-3 rounded-full items-center justify-center ${filter === 'series' ? 'bg-secondary' : 'bg-transparent'}`}
            >
                <Text className={`font-bold ${filter === 'series' ? 'text-primary' : 'text-gray-400'}`}>TV Series</Text>
            </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default Watchlist;