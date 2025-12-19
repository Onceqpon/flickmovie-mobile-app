import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar"; // Dodano dla białego paska statusu
import { cssInterop } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";

import { updateSearchCount, updateSeriesSearchCount } from "@/services/appwriteapi";
import { fetchMovies, fetchTVSeries } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";

import MovieDisplayCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TVSeriesCard from "@/components/TVSeriesCard";

// Konfiguracja stylów dla Gradientu
cssInterop(LinearGradient, {
  className: "style",
});

const Search = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- POBIERANIE DANYCH ---
  const {
    data: movies = [],
    loading: moviesLoading,
    error: moviesError,
    refetch: loadMovies,
    reset: resetMovies,
  } = useLoadData(
    () => fetchMovies({ query: searchQuery }),
    [searchQuery],
    false
  );

  const {
    data: series = [],
    loading: seriesLoading,
    error: seriesError,
    refetch: loadSeries,
    reset: resetSeries,
  } = useLoadData(
    () => fetchTVSeries({ query: searchQuery }),
    [searchQuery],
    false
  );

  // --- OBSŁUGA INPUTU ---
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Debounce (opóźnienie wyszukiwania)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        loadMovies();
        loadSeries();
      } else {
        resetMovies();
        resetSeries();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // --- BEZPIECZNE COFANIE ---
  const handleBack = useCallback(() => {
    Keyboard.dismiss(); // Schowaj klawiaturę
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)'); 
    }
  }, [router]);

  // --- OBSŁUGA KLIKNIĘCIA (TYLKO STATYSTYKI) ---
  // Uwaga: Zakładamy, że MovieCard i TVSeriesCard mają w sobie router.push
  
  const handleMoviePress = (item: any) => {
    updateSearchCount(searchQuery, item).catch(err => 
        console.error("Error updating movie count:", err)
    );
  };

  const handleSeriesPress = (item: any) => {
    updateSeriesSearchCount(searchQuery, item).catch(err => 
        console.error("Error updating series count:", err)
    );
  };

  const isLoading = moviesLoading || seriesLoading;
  const error = moviesError || seriesError;
  const hasMovies = Array.isArray(movies) && movies.length > 0;
  const hasSeries = Array.isArray(series) && series.length > 0;

  return (
    // Główny kontener - kolor tła zgodny z górą gradientu
    <View className="flex-1 bg-[#000C1C]">
      <StatusBar style="light" />
      
      {/* GLOBALNE TŁO GRADIENTOWE */}
      <LinearGradient
          colors={["#000C1C", "#161622", "#1E1E2D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="absolute w-full h-full"
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* HEADER */}
          <View className="flex-row items-center justify-between mt-4 mb-2">
            <TouchableOpacity 
              onPress={handleBack}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              activeOpacity={0.7}
              className="bg-black-100 p-2 rounded-full border border-black-200"
            >
              <Image
                source={icons.left_arrow} 
                className="w-5 h-5"
                resizeMode="contain"
                tintColor="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* LOGO */}
          <View className="mb-8">
            <Text className="text-4xl text-white font-black text-center tracking-wider">
              FLICK<Text className="text-secondary">MOVIE</Text>
            </Text>
          </View>

          {/* SEARCH BAR */}
          <View className="mb-5">
            <SearchBar
              placeholder="Search for movies or TV series"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus={true}
            />
          </View>

          {/* LOADING */}
          {isLoading && (
            <ActivityIndicator
              size="large"
              color="#FF8C00"
              className="my-3 self-center"
            />
          )}

          {/* ERROR */}
          {error && (
            <Text className="text-red-500 px-5 my-3 text-center">
              Error: {error.message}
            </Text>
          )}

          {/* NO RESULTS */}
          {!isLoading && !hasMovies && !hasSeries && searchQuery.trim() !== "" && (
             <View className="mt-10 px-5">
                <Text className="text-center text-gray-500">
                  {`No results found for "${searchQuery}"`}
                </Text>
             </View>
          )}

          {/* EMPTY STATE (START) */}
          {!isLoading && searchQuery.trim() === "" && (
               <View className="mt-10 px-5">
               <Text className="text-center text-gray-500">
                 Start typing to search...
               </Text>
             </View>
          )}

          {/* --- MOVIES LIST --- */}
          {!isLoading && hasMovies && (
            <View className="mb-8">
              <Text className="text-xl text-white font-bold mb-4">
                Movies for <Text className="text-secondary">{searchQuery}</Text>
              </Text>
              
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={movies as any[]}
                keyExtractor={(item) => `movie-${item.id}`}
                contentContainerStyle={{ gap: 16 }}
                initialNumToRender={4}      
                maxToRenderPerBatch={4}
                windowSize={3}
                removeClippedSubviews={true}
                renderItem={({ item }) => (
                  <MovieDisplayCard
                    {...item}
                    className="w-[140px]" 
                    onPress={() => handleMoviePress(item)}
                  />
                )}
              />
            </View>
          )}

          {/* --- SERIES LIST --- */}
          {!isLoading && hasSeries && (
            <View>
              <Text className="text-xl text-white font-bold mb-4">
                TV Series for <Text className="text-secondary">{searchQuery}</Text>
              </Text>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={series as any[]}
                keyExtractor={(item) => `series-${item.id}`}
                contentContainerStyle={{ gap: 16 }}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={3}
                removeClippedSubviews={true}
                renderItem={({ item }) => (
                  <TVSeriesCard
                    {...item}
                    className="w-[140px]"
                    onPress={() => handleSeriesPress(item)}
                  />
                )}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Search;