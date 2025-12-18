import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Importy serwisów
import { icons } from "@/constants/icons"; // Import ikon
import { getTrendingMovies, getTrendingSeries } from "@/services/appwriteapi";
import { fetchMovies, fetchTVSeries, SORT_OPTIONS } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";

// Komponenty
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingMovieCard";
import TrendingSeriesCard from "@/components/TrendingTVSeriesCard";
import TVSeriesCard from "@/components/TVSeriesCard";

// --- KOMPONENT KARTY "MORE" ---
const MoreCard = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="w-[140px] justify-center items-center bg-secondary/10 rounded-[18px] border-2 border-secondary/30 overflow-hidden"
      style={{ aspectRatio: 2 / 3 }}
    >
      <View className="items-center justify-center space-y-3">
        <View className="w-16 h-16 rounded-full bg-secondary justify-center items-center shadow-lg shadow-secondary/50">
           <Image
             source={icons.plus}
             className="w-8 h-8"
             resizeMode="contain"
             tintColor="#000C1C" 
           />
        </View>
        <Text className="text-secondary font-black text-xl tracking-wider uppercase">
          MORE
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- SMART COMPONENT: MOVIE SECTION ---
interface SectionProps {
  title: string;
  sortBy?: string;
}

const MovieSection = ({ title, sortBy }: SectionProps) => {
  const router = useRouter(); // Potrzebny do nawigacji z przycisku More
  const { data, loading, error } = useLoadData(
    () => fetchMovies({ sortBy }),
    []
  );

  if (loading) {
    return (
      <View className="mt-8 h-[200px] justify-center items-center">
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }

  if (error || !data || data.length === 0) return null;

  return (
    <View className="mt-8 bg-white/10 py-5 rounded-3xl">
      <Text className="text-lg text-white font-bold mb-3 px-4">{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        contentContainerStyle={{
          gap: 14,
          paddingHorizontal: 16, 
        }}
        renderItem={({ item }) => (
          <MovieCard {...item} className="w-[140px]" />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={() => (
          <MoreCard 
            onPress={() => {
              router.push({
                pathname: "/category/[id]",
                // Przekazujemy sortBy jako ID (np. "popularity.desc")
                params: { id: sortBy || 'popular', name: title, type: 'movie' }
              });
            }} 
          />
        )}
      />
    </View>
  );
};

// --- SMART COMPONENT: SERIES SECTION ---
const SeriesSection = ({ title, sortBy }: SectionProps) => {
  const router = useRouter();
  const { data, loading, error } = useLoadData(
    () => fetchTVSeries({ sortBy }),
    []
  );

  if (loading) {
    return (
      <View className="mt-8 h-[200px] justify-center items-center">
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }

  if (error || !data || data.length === 0) return null;

  return (
    <View className="mt-8 bg-white/10 py-5 rounded-3xl">
      <Text className="text-lg text-white font-bold mb-3 px-4">{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        contentContainerStyle={{
          gap: 14,
          paddingHorizontal: 16,
        }}
        renderItem={({ item }) => (
          <TVSeriesCard {...item} className="w-[140px]" />
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

// --- GŁÓWNY WIDOK ---
const Index = () => {
  const router = useRouter();

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
    <View className="flex-1 bg-primary">
      
      {/* Tło Gradientowe */}
      <LinearGradient
        colors={["#000C1C", "#161622", "#1E1E2D"]}
        className="absolute w-full h-full"
      />

      <ScrollView
        className="flex-1 px-4" 
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

          {/* --- SEKCJA TRENDÓW FILMÓW --- */}
          {trendingLoading ? (
            <ActivityIndicator size="large" color="#0000ff" className="mt-10" />
          ) : trendingError ? (
            <Text className="text-red-500 mt-5">Error loading trends</Text>
          ) : (
            trendingMovies && trendingMovies.length > 0 && (
              <View className="mt-10 bg-white/10 py-5 rounded-3xl">
                <Text className="text-lg text-white font-bold mb-3 px-4">
                  Trending Movies
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={trendingMovies}
                  contentContainerStyle={{ gap: 20, paddingHorizontal: 16 }}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}
                />
              </View>
            )
          )}

          {/* --- SEKCJA TRENDÓW SERIALI --- */}
          {trendingSeriesLoading ? (
            <ActivityIndicator size="large" color="#0000ff" className="mt-10" />
          ) : trendingSeriesError ? (
            <Text className="text-red-500 mt-5">Error loading series trends</Text>
          ) : (
            trendingSeries && trendingSeries.length > 0 && (
              <View className="mt-8 bg-white/10 py-5 rounded-3xl">
                <Text className="text-lg text-white font-bold mb-3 px-4">
                  Trending Series
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={trendingSeries}
                  contentContainerStyle={{ gap: 20, paddingHorizontal: 16 }}
                  renderItem={({ item, index }) => (
                    <TrendingSeriesCard series={item} index={index} />
                  )}
                  keyExtractor={(item) => item.series_id.toString()}
                />
              </View>
            )
          )}

          {/* --- SEKCJE TMDB --- */}
          
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