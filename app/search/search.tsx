import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";

import { images } from "@/constants/images";

import { updateSearchCount, updateSeriesSearchCount } from "@/services/appwriteapi";
import { fetchMovies, fetchTVSeries } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";

import MovieDisplayCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TVSeriesCard from "@/components/TVSeriesCard";

const Search = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

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
  }, [searchQuery, loadMovies, loadSeries, resetMovies, resetSeries]);

  const isLoading = moviesLoading || seriesLoading;
  const error = moviesError || seriesError;

  const hasMovies = Array.isArray(movies) && movies.length > 0;
  const hasSeries = Array.isArray(series) && series.length > 0;

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
        contentContainerStyle={{ paddingBottom: 100 }}
      >

        <View className="w-full flex-row justify-center mt-20 items-center">
          <Text className="text-5xl text-white font-black text-center tracking-wider mt-20 mb-5 ">
                FLICK<Text className="text-secondary">MOVIE</Text>
             </Text>
        </View>

        <View className="my-5">
          <SearchBar
            placeholder="Search for movies or TV series"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {isLoading && (
          <ActivityIndicator
            size="large"
            color="#FF8C00"
            className="my-3 self-center"
          />
        )}

        {error && (
          <Text className="text-red-500 px-5 my-3">
            Error: {error.message}
          </Text>
        )}

        {!isLoading && !hasMovies && !hasSeries && searchQuery.trim() !== "" && (
           <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {`No results found for "${searchQuery}"`}
              </Text>
            </View>
        )}

        {!isLoading && searchQuery.trim() === "" && (
             <View className="mt-10 px-5">
             <Text className="text-center text-gray-500">
               Start typing to search...
             </Text>
           </View>
        )}

        {!isLoading && hasMovies && (
          <View className="mb-8">
            <Text className="text-xl text-white font-bold mb-4">
              Movies for <Text className="text-accent">{searchQuery}</Text>
            </Text>
            
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={movies as Movie[]}
              keyExtractor={(item) => `movie-${item.id}`}
              contentContainerStyle={{
                gap: 16,
              }}
              renderItem={({ item }) => (
                <MovieDisplayCard
                  {...item}
                  className="w-[140px]" 
                  onPress={() => {
                    updateSearchCount(searchQuery, item);
                    router.push(`/movies/${item.id}`);
                  }}
                />
              )}
            />
          </View>
        )}

        {!isLoading && hasSeries && (
          <View>
            <Text className="text-xl text-white font-bold mb-4">
              TV Series for <Text className="text-accent">{searchQuery}</Text>
            </Text>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={series as TVSeries[]}
              keyExtractor={(item) => `series-${item.id}`}
              contentContainerStyle={{
                gap: 16,
              }}
              renderItem={({ item }) => (
                <TVSeriesCard
                  {...item}
                  className="w-[140px]"
                  onPress={() => {
                    updateSeriesSearchCount(searchQuery, item);
                    router.push(`/tvseries/${item.id}`);
                  }}
                />
              )}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Search;