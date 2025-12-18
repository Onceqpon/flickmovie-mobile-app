import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";

// DODANO: getTrendingSeries
import { getTrendingMovies, getTrendingSeries } from "@/services/appwriteapi";
import { fetchMovies, fetchTVSeries, SORT_OPTIONS } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";

import { images } from "@/constants/images";

import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
// Używamy TrendingCard dla filmów (chyba że zmieniłeś nazwę pliku na TrendingMovieCard)
import TrendingCard from "@/components/TrendingMovieCard";
import TrendingSeriesCard from "@/components/TrendingTVSeriesCard";
import TVSeriesCard from "@/components/TVSeriesCard";

// --- SMART COMPONENT: MOVIE SECTION ---
interface SectionProps {
  title: string;
  sortBy?: string;
}

const MovieSection = ({ title, sortBy }: SectionProps) => {
  const { data, loading, error } = useLoadData(
    () => fetchMovies({ sortBy }), 
    []
  );

  if (loading) {
    return (
      <View className="mt-10 h-[200px] justify-center items-center">
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }

  if (error || !data || data.length === 0) return null;

  return (
    <View className="mt-10">
      <Text className="text-lg text-white font-bold mb-3">{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4 mt-3"
        data={data}
        contentContainerStyle={{
          gap: 20,
          paddingRight: 20,
        }}
        renderItem={({ item }) => (
          <MovieCard {...item} className="w-[140px]" />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

// --- SMART COMPONENT: SERIES SECTION ---
const SeriesSection = ({ title, sortBy }: SectionProps) => {
  const { data, loading, error } = useLoadData(
    () => fetchTVSeries({ sortBy }), 
    []
  );

  if (loading) {
    return (
      <View className="mt-10 h-[200px] justify-center items-center">
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }

  if (error || !data || data.length === 0) return null;

  return (
    <View className="mt-10">
      <Text className="text-lg text-white font-bold mb-3">{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4 mt-3"
        data={data}
        contentContainerStyle={{
          gap: 20,
          paddingRight: 20,
        }}
        renderItem={({ item }) => (
          <TVSeriesCard {...item} className="w-[140px]" />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

// --- GŁÓWNY WIDOK ---
const Index = () => {
  const router = useRouter();

  // 1. Trendy Filmów
  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useLoadData(getTrendingMovies, []);

  // 2. Trendy Seriali (TO BYŁO BRAKUJĄCE W TWOIM KODZIE)
  const {
    data: trendingSeries,
    loading: trendingSeriesLoading,
    error: trendingSeriesError,
  } = useLoadData(getTrendingSeries, []);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.mainbg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 100 }}
      >
        <Text className="text-5xl text-white font-black text-center tracking-wider mt-20 mb-5 ">
                FLICK<Text className="text-secondary">MOVIE</Text>
             </Text>

        <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => {
                router.push("/search/search");
              }}
              placeholder="Search for a movie or series"
            />

            {/* --- SEKCJA TRENDÓW FILMÓW (APPWRITE) --- */}
            {trendingLoading ? (
               <ActivityIndicator size="large" color="#0000ff" className="mt-10" />
            ) : trendingError ? (
               <Text className="text-red-500 mt-5">Error loading trends</Text>
            ) : (
               trendingMovies && trendingMovies.length > 0 && (
                <View className="mt-10">
                  <Text className="text-lg text-white font-bold mb-3">
                    Trending Movies
                  </Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-4 mt-3"
                    data={trendingMovies}
                    contentContainerStyle={{ gap: 26 }}
                    renderItem={({ item, index }) => (
                      <TrendingCard movie={item} index={index} />
                    )}
                    keyExtractor={(item) => item.movie_id.toString()}
                  />
                </View>
              )
            )}

            {/* --- SEKCJA TRENDÓW SERIALI (APPWRITE) --- */}
            {trendingSeriesLoading ? (
              <ActivityIndicator size="large" color="#0000ff" className="mt-10" />
            ) : trendingSeriesError ? (
              <Text className="text-red-500 mt-5">Error loading series trends</Text>
            ) : (
              trendingSeries && trendingSeries.length > 0 && (
                <View className="mt-10">
                  <Text className="text-lg text-white font-bold mb-3">
                    Trending Series
                  </Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-4 mt-3"
                    data={trendingSeries}
                    contentContainerStyle={{ gap: 26 }}
                    renderItem={({ item, index }) => (
                      <TrendingSeriesCard series={item} index={index} />
                    )}
                    keyExtractor={(item) => item.series_id.toString()}
                  />
                </View>
              )
            )}

            {/* --- MIESZANE SEKCJE (TMDB) --- */}
            <MovieSection title="Latest Movies" /> 
            <SeriesSection title="New TV Series Episodes" sortBy={SORT_OPTIONS.NEWEST} />
            
            <MovieSection title="Popular Movies" sortBy={SORT_OPTIONS.POPULARITY} />
            <SeriesSection title="Popular TV Series" sortBy={SORT_OPTIONS.POPULARITY} />
            
            <MovieSection title="Top Rated Movies" sortBy={SORT_OPTIONS.TOP_RATED} />
            <SeriesSection title="Top Rated TV Series" sortBy={SORT_OPTIONS.TOP_RATED} />
            
            <MovieSection title="Highest Revenue Movies" sortBy={SORT_OPTIONS.REVENUE} />
            
            <MovieSection title="Most Voted Movies" sortBy={SORT_OPTIONS.MOST_VOTED} />
            <SeriesSection title="Most Voted TV Series" sortBy={SORT_OPTIONS.MOST_VOTED} />
            
          </View>
      </ScrollView>
    </View>
  );
};

export default Index;