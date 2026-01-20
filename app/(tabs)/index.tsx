import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import { getTrendingMovies, getTrendingSeries } from "@/services/appwriteapi";
import { fetchMovies, fetchTVSeries, SORT_OPTIONS } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";

import FlickMatchBanner from "@/components/FlickMatchBanner";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingMovieCard";
import TrendingSeriesCard from "@/components/TrendingTVSeriesCard";
import TVSeriesCard from "@/components/TVSeriesCard";

const MoreCard = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="w-[140px] justify-center items-center bg-white/5 rounded-2xl border border-white/10 ml-2"
      style={{ aspectRatio: 2 / 3 }}
    >
      <View className="items-center justify-center space-y-3 opacity-80">
        <View className="w-14 h-14 rounded-full bg-secondary/20 justify-center items-center border border-secondary/50">
           <Image
             source={icons.plus || icons.search} 
             className="w-6 h-6"
             resizeMode="contain"
             tintColor="#FF9C01" 
           />
        </View>
        <Text className="text-gray-300 font-bold text-sm tracking-widest uppercase">
          View All
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <View className="flex-row items-center mb-4 px-4 mt-8">
    <View className="w-1 h-6 bg-secondary rounded-full mr-3" />
    <Text className="text-xl text-white font-bold tracking-wide">
      {title}
    </Text>
  </View>
);

interface SectionProps {
  title: string;
  sortBy?: string;
}

const MovieSection = ({ title, sortBy }: SectionProps) => {
  const router = useRouter();
  const { data, loading, error } = useLoadData(
    () => fetchMovies({ sortBy }),
    []
  );

  if (loading) return null; 
  if (error || !data || data.length === 0) return null;

  return (
    <View className="mb-2">
      <SectionHeader title={title} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16, 
        }}
        renderItem={({ item }) => (
          <MovieCard {...item} className="w-[140px] shadow-lg shadow-black/40" />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={() => (
          <MoreCard 
            onPress={() => {
              router.push({
                pathname: "/category/[id]",
                params: { id: sortBy || 'popular', name: title, type: 'movie' }
              });
            }} 
          />
        )}
      />
    </View>
  );
};

const SeriesSection = ({ title, sortBy }: SectionProps) => {
  const router = useRouter();
  const { data, loading, error } = useLoadData(
    () => fetchTVSeries({ sortBy }),
    []
  );

  if (loading) return null;
  if (error || !data || data.length === 0) return null;

  return (
    <View className="mb-2">
      <SectionHeader title={title} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16,
        }}
        renderItem={({ item }) => (
          <TVSeriesCard {...item} className="w-[140px] shadow-lg shadow-black/40" />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={() => (
          <MoreCard 
            onPress={() => {
              router.push({
                pathname: "/category/[id]",
                params: { id: sortBy || 'popular', name: title, type: 'tv' }
              });
            }} 
          />
        )}
      />
    </View>
  );
};

const Index = () => {
  const router = useRouter();
  const { user } = useGlobalContext();

  const userAvatarUrl = (user?.prefs as any)?.avatar 
    ? (user?.prefs as any).avatar 
    : `https://cloud.appwrite.io/v1/avatars/initials?name=${encodeURIComponent(user?.name || 'User')}&project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useLoadData(getTrendingMovies, []);

  const {
    data: trendingSeries,
    loading: trendingSeriesLoading,
    error: trendingSeriesError,
  } = useLoadData(getTrendingSeries, []);

  return (
    <View className="flex-1 bg-[#000C1C]">
      <StatusBar style="light" />
      
      <LinearGradient
        colors={["#000C1C", "#13132B", "#1E1E2D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute w-full h-full"
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="flex-row justify-between items-center px-5 mt-2 mb-6">
            <View>
              <Text className="font-pmedium text-sm text-gray-200">Welcome Back</Text>
              <Text className="text-3xl text-white font-black tracking-wider">
                FLICK<Text className="text-secondary">MOVIE</Text>
              </Text>
            </View>
            
            <TouchableOpacity 
                className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-gray-800"
                onPress={() => router.push('/profile')}
            >
                <Image 
                  source={{ uri: userAvatarUrl }} 
                  className="w-full h-full" 
                  resizeMode="cover" 
                />
            </TouchableOpacity>
          </View>

          <View className="px-5 mb-6">
            <SearchBar
              onPress={() => router.push("/search/search")}
              placeholder="Discover movies & series..."
            />
          </View>

          {!trendingLoading && !trendingError && (trendingMovies?.length || 0) > 0 && (
            <View className="mb-4">
              <Text className="text-gray-400 text-sm font-pregular px-5 mb-3 uppercase tracking-widest">
                Trending Movies
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={trendingMovies}
                contentContainerStyle={{ gap: 24, paddingHorizontal: 20 }}
                snapToInterval={180} 
                decelerationRate="fast"
                renderItem={({ item, index }) => (
                  <TrendingCard movie={item} index={index} />
                )}
                keyExtractor={(item) => item.movie_id.toString()}
              />
            </View>
          )}

          {!trendingSeriesLoading && !trendingSeriesError && (trendingSeries?.length || 0) > 0 && (
              <View className="mb-4">
                <Text className="text-gray-400 text-sm font-pregular px-5 mb-3 mt-4 uppercase tracking-widest">
                Trending Series
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={trendingSeries}
                contentContainerStyle={{ gap: 24, paddingHorizontal: 20 }}
                snapToInterval={180}
                decelerationRate="fast"
                renderItem={({ item, index }) => (
                  <TrendingSeriesCard series={item} index={index} />
                )}
                keyExtractor={(item) => item.series_id.toString()}
              />
            </View>
          )}

          <FlickMatchBanner />
          
          <MovieSection title="Latest Movies" />
          <SeriesSection title="New Episodes" sortBy={SORT_OPTIONS.NEWEST} />

          <MovieSection title="Popular Movies" sortBy={SORT_OPTIONS.POPULARITY} />
          <SeriesSection title="Popular TV Series" sortBy={SORT_OPTIONS.POPULARITY} />

          <MovieSection title="Top Rated" sortBy={SORT_OPTIONS.TOP_RATED} />

          <MovieSection title="Blockbusters" sortBy={SORT_OPTIONS.REVENUE} />
          <MovieSection title="Fan Favorites" sortBy={SORT_OPTIONS.MOST_VOTED} />
        
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Index;