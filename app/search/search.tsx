import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import { updateSearchCount } from "@/services/appwriteapi";
import { fetchMovies } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";

import MovieDisplayCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: movies = [],
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useLoadData(() => fetchMovies({ query: searchQuery }), false);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        loadMovies();
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadMovies, reset]);

  useEffect(() => {
    if (Array.isArray(movies) && !loading && !error && movies.length > 0 && searchQuery.trim()) {
      const firstMovie = movies[0];
      updateSearchCount(searchQuery, firstMovie);
    }
  }, [movies, searchQuery, loading, error]);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.mainbg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        className="px-5"
        data={movies as Movie[]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieDisplayCard {...item} />}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            <View className="my-5">
              <SearchBar
                placeholder="Search for a movie"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            {loading && (
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

            {!loading &&
              !error &&
              searchQuery.trim() &&
              Array.isArray(movies) && 
              movies.length > 0 && (
                <Text className="text-xl text-white font-bold">
                  Search Results for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim()
                  ? "No movies found"
                  : "Start typing to search for movies"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;