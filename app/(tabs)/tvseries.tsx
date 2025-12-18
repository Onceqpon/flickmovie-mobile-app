import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { icons } from "@/constants/icons";
import { fetchTVSeries } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";

import SearchBar from "@/components/SearchBar";
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

// --- LISTA GATUNKÓW TV ---
const tvGenres = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

// --- SEKCJA GATUNKU ---
// POPRAWKA: Zmieniono typ id z 'number | null' na 'number', aby router nie zgłaszał błędu.
const GenreSection = ({ genre }: { genre: { id: number; name: string } }) => {
  const router = useRouter();

  const { data: series, loading, error } = useLoadData(
    () => fetchTVSeries({ query: "", genreId: genre.id }), 
    []
  );

  if (loading) {
    return (
      <View className="mt-8 h-52 justify-center">
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  if (error || !series || series.length === 0) {
    return null; 
  }

  return (
    <View className="mt-8 bg-white/10 py-5 rounded-3xl">
      <Text className="text-lg text-white font-bold mb-3 px-4">
        {genre.name}
      </Text>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={series}
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
              // Teraz genre.id jest pewnym numerem, więc TS nie zgłosi błędu
              router.push({
                pathname: "/category/[id]",
                params: { id: genre.id, name: genre.name, type: 'tv' }
              });
            }} 
          />
        )}
      />
    </View>
  );
};

// --- GŁÓWNY KOMPONENT ---
const TVSeries = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary">
      
      {/* TŁO GRADIENTOWE */}
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
            placeholder="Search for a TV series"
          />
          
          <View className="mt-5">
            {tvGenres.map((genre) => (
              <GenreSection key={genre.name} genre={genre} />
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default TVSeries;