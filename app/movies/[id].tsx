import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Reviews from "@/components/Reviews";
import WatchlistButton from "@/components/WatchlistButton";
import { icons } from "@/constants/icons";
import { fetchMovieDetails } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";
import { useState } from "react";
import SaveToListModal from '../../components/SaveToListModal'; // Upewnij się, że ścieżka jest poprawna

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-white font-normal text-sm">{label}</Text>
    <Text className="text-white font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const formatCurrency = (amount: number | undefined): string => {
  if (!amount || amount === 0) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);

  const movieId = Array.isArray(id) ? id[0] : (id as string | undefined);
  const shouldFetch = !!movieId;

  const { data: movie, loading, error } = useLoadData<MovieDetails>(
    () => fetchMovieDetails(movieId!), 
    [movieId],  
    shouldFetch 
  );

  if (!movieId) {
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <Text className="text-white text-lg">No movie ID provided.</Text>
        <TouchableOpacity onPress={router.back}>
          <Text className="text-secondary mt-4">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF9C01" />
      </SafeAreaView>
    );
    
  if (error) {
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">Error loading details: {error.message}</Text>
        <TouchableOpacity onPress={router.back}>
          <Text className="text-secondary mt-4">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <Text className="text-white text-lg">Movie not found.</Text>
        <TouchableOpacity onPress={router.back}>
          <Text className="text-secondary mt-4">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="cover"
          />

          {/* Kontener Przycisków Akcji (Watchlist + SaveToList) */}
          <View className="absolute bottom-5 right-5 flex-row gap-4">
            
            {/* Przycisk Watchlist */}
            <View className="rounded-full size-14 bg-white flex items-center justify-center shadow-lg">
               <WatchlistButton 
                 item={{
                   id: movie.id,
                   title: movie.title,
                   poster_path: movie.poster_path || "",
                   vote_average: movie.vote_average || 0
                 }} 
                 type="movie"
               />
            </View>

            {/* --- NOWY PRZYCISK: Dodaj do Listy --- */}
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              className="rounded-full size-14 bg-white flex items-center justify-center shadow-lg"
              activeOpacity={0.8}
            >
               <Image 
                 source={icons.plus} // Upewnij się, że masz ikonę bookmark w constants/icons
                 className="size-7" 
                 resizeMode="contain" 
                 tintColor="#FF9C01" // Kolor akcentu
               />
            </TouchableOpacity>

          </View>
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie.title}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-white text-sm">
              {movie.release_date?.split("-")[0]} •
            </Text>
            <Text className="text-white text-sm">{movie.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" tintColor="#FF9C01" />

            <Text className="text-white font-bold text-sm">
              {Math.round(movie.vote_average ?? 0)}/10
            </Text>

            <Text className="text-white text-sm">
              ({movie.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie.overview} />
          <MovieInfo
            label="Genres"
            value={movie.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-full">
            <MovieInfo
              label="Budget"
              value={formatCurrency(movie.budget)}
            />
            <MovieInfo
              label="Revenue"
              value={formatCurrency(movie.revenue)}
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie.production_companies?.map((c) => c.name).join(" • ") ||
              "N/A"
            }
          />
        </View>
        <Reviews movieId={Number(id)} title={movie.title} posterPath={movie.poster_path || ""} />
      </ScrollView>

      {/* Przycisk powrotu (Strzałka w lewo) */}
      <TouchableOpacity
        className="absolute top-12 left-5 bg-white rounded-full p-2 z-50 backdrop-blur-lg"
        onPress={router.back}
      >
        <Image
          source={icons.angle_left}
          className="size-6"
          resizeMode="contain"
          tintColor="#000000"
        />
      </TouchableOpacity>

      {/* --- MODAL DO WYBORU LISTY --- */}
      <SaveToListModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        mediaId={movie.id}
        mediaType="movie"
      />

    </View>
  );
};

export default Details;