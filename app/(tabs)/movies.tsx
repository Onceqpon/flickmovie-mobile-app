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
import { fetchMovies } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";
// 1. IMPORT KONTEKSTU
import { useGlobalContext } from "@/context/GlobalProvider";

import FlickMatchBanner from "@/components/FlickMatchBanner";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";

// --- KOMPONENT KARTY "MORE" ---
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

// --- NAGŁÓWEK SEKCJI ---
const SectionHeader = ({ title }: { title: string }) => (
  <View className="flex-row items-center mb-4 px-4 mt-6">
    <View className="w-1 h-6 bg-secondary rounded-full mr-3" />
    <Text className="text-xl text-white font-bold tracking-wide">
      {title}
    </Text>
  </View>
);

// --- DANE GATUNKÓW ---
const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

// --- SEKCJA GATUNKU ---
const GenreSection = ({ genre }: { genre: { id: number; name: string } }) => {
  const router = useRouter();
  
  const { data: movies, loading, error } = useLoadData(
    () => fetchMovies({ query: "", genreId: genre.id }), 
    []
  );

  if (loading) return null;

  if (error || !movies || movies.length === 0) {
    return null; 
  }

  return (
    <View className="mb-2">
      <SectionHeader title={genre.name} />
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={movies}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 16, 
        }}
        renderItem={({ item }) => (
          <MovieCard 
            {...item} 
            className="w-[140px] shadow-lg shadow-black/40" 
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={() => (
          <MoreCard 
            onPress={() => {
              router.push({
                pathname: "/category/[id]",
                params: { id: genre.id, name: genre.name, type: 'movie' }
              });
            }} 
          />
        )}
      />
    </View>
  );
};

// --- GŁÓWNY WIDOK ---
const Movies = () => {
  const router = useRouter();

  // 2. POBIERANIE DANYCH UŻYTKOWNIKA
  const { user } = useGlobalContext();
  const rawAvatar = (user?.prefs as any)?.avatar;
  const userAvatar = typeof rawAvatar === 'string' ? rawAvatar : null;

  return (
    <View className="flex-1 bg-[#000C1C]">
      <StatusBar style="light" />
      
      {/* TŁO GRADIENTOWE */}
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
          {/* --- CUSTOM HEADER --- */}
          <View className="flex-row justify-between items-center px-5 mt-2 mb-6">
            <View>
              <Text className="font-pmedium text-sm text-gray-200">Browse by Genre</Text>
              <Text className="text-3xl text-white font-black tracking-wider">
                Explore <Text className="text-secondary">Movies</Text>
              </Text>
            </View>
            
            {/* 3. LOGIKA AWATARA */}
            <TouchableOpacity 
                className="w-10 h-10 bg-white/10 rounded-full justify-center items-center border border-white/20 overflow-hidden"
                onPress={() => router.push('/profile')}
            >
                {userAvatar ? (
                  <Image 
                    source={{ uri: userAvatar }} 
                    className="w-full h-full" 
                    resizeMode="cover" 
                  />
                ) : (
                  <Image 
                    source={icons.user} 
                    className="w-6 h-6" 
                    resizeMode="contain" 
                    tintColor="#fff"
                  />
                )}
            </TouchableOpacity>
          </View>

          {/* --- SEARCH BAR --- */}
          <View className="px-5 mb-4">
            <SearchBar
              onPress={() => {
                router.push("/search/search");
              }}
              placeholder="Search for a movie..."
            />
          </View>

        <FlickMatchBanner />

          {/* --- LISTA GATUNKÓW --- */}
          <View className="mt-2">
            {genres.map((genre) => (
              <GenreSection key={genre.name} genre={genre} />
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Movies;