import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Reviews from "@/components/Reviews";
import SaveToListModal from "@/components/SaveToListModal";
import WatchlistButton from "@/components/WatchlistButton";
import WatchProviders from "@/components/WatchProviders";
import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import { fetchMovieDetails } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

cssInterop(LinearGradient, {
  className: "style",
});

const formatCurrency = (amount: number | undefined): string => {
  if (!amount || amount === 0) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="mb-4">
    <Text className="text-gray-400 text-xs uppercase tracking-wider mb-1">
      {label}
    </Text>
    <Text className="text-white font-semibold text-base">
      {value || "N/A"}
    </Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isLogged } = useGlobalContext();
  
  const [modalVisible, setModalVisible] = useState(false);

  const movieId = Array.isArray(id) ? id[0] : (id as string | undefined);
  const shouldFetch = !!movieId;

  const { data: movie, loading, error } = useLoadData(
    () => fetchMovieDetails(movieId!),
    [movieId],
    shouldFetch
  );

  const getPolishProviders = () => {
    if (!movie || !movie["watch/providers"] || !movie["watch/providers"].results) return null;
    return movie["watch/providers"].results["PL"];
  };

  if (!movieId) return null;

  if (loading)
    return (
      <View className="flex-1 justify-center items-center">
        <LinearGradient
            colors={["#000C1C", "#161622", "#1E1E2D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="absolute w-full h-full"
        />
        <ActivityIndicator size="large" color="#FF9C01" />
      </View>
    );

  if (error || !movie) {
    return (
      <View className="flex-1 justify-center items-center">
        <LinearGradient
            colors={["#000C1C", "#161622", "#1E1E2D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="absolute w-full h-full"
        />
        <Text className="text-red-500 text-lg mb-4">
          {error ? `Error: ${error.message}` : "Movie not found"}
        </Text>
        <TouchableOpacity onPress={router.back}>
          <Text className="text-secondary font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <LinearGradient
        colors={["#000C1C", "#161622", "#1E1E2D"]}
        className="absolute w-full h-full"
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative w-full h-[550px]">
          <Image
            source={{
              uri: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`,
            }}
            className="w-full h-full"
            resizeMode="cover"
          />

          <LinearGradient
            colors={["transparent", "#161622"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 300,
            }}
          />

          {isLogged && (
            <View className="absolute bottom-10 right-5 flex-row gap-4 z-10">
                <View className="rounded-full w-14 h-14 bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                <WatchlistButton
                    item={{
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path || "",
                    vote_average: movie.vote_average || 0,
                    }}
                    type="movie"
                />
                </View>

                <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="rounded-full w-14 h-14 bg-secondary flex items-center justify-center shadow-lg shadow-secondary/30"
                activeOpacity={0.8}
                >
                <Image
                    source={icons.plus}
                    className="w-7 h-7"
                    resizeMode="contain"
                    tintColor="#161622"
                />
                </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="px-5 -mt-6">
          <Text className="text-white font-black text-3xl mb-2 leading-tight">
            {movie.title}
          </Text>

          <View className="flex-row items-center flex-wrap gap-3 mb-5">
            <Text className="text-gray-300 font-medium">
              {movie.release_date?.split("-")[0]}
            </Text>
            <View className="w-1 h-1 bg-gray-500 rounded-full" />
            <Text className="text-gray-300 font-medium">{movie.runtime}m</Text>
            <View className="w-1 h-1 bg-gray-500 rounded-full" />
            <View className="flex-row items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-xs">
              <Image
                source={icons.star}
                className="w-3.5 h-3.5"
                tintColor="#FF9C01"
              />
              <Text className="text-secondary font-bold">
                {movie.vote_average?.toFixed(1)}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2 mb-6">
            {movie.genres?.map((g: any) => (
              <View
                key={g.id}
                className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
              >
                <Text className="text-gray-300 text-xs font-medium">
                  {g.name}
                </Text>
              </View>
            ))}
          </View>

          <WatchProviders providers={getPolishProviders()} />

          <Text className="text-white font-bold text-lg mb-2">Overview</Text>
          <Text className="text-gray-300 text-base leading-6 mb-6">
            {movie.overview}
          </Text>

          <View className="flex-row justify-between bg-white/5 p-4 rounded-2xl mb-8 border border-white/10">
            <View className="flex-1 mr-2">
              <MovieInfo label="Budget" value={formatCurrency(movie.budget)} />
              <MovieInfo
                label="Revenue"
                value={formatCurrency(movie.revenue)}
              />
            </View>
            <View className="flex-1">
              <MovieInfo
                label="Production"
                value={
                  movie.production_companies?.[0]?.name ||
                  (movie.production_companies?.length
                    ? "Multiple"
                    : "N/A")
                }
              />
              <MovieInfo label="Status" value={movie.status} />
            </View>
          </View>
        </View>

        <Reviews
          movieId={Number(id)}
          title={movie.title}
          posterPath={movie.poster_path || ""}
        />
      </ScrollView>

      <TouchableOpacity
        className="absolute top-14 left-5 bg-black/40 backdrop-blur-md rounded-full p-2.5 z-50 border border-white/10"
        onPress={router.back}
      >
        <Image
          source={icons.angle_left}
          className="w-6 h-6"
          resizeMode="contain"
          tintColor="#FFFFFF"
        />
      </TouchableOpacity>

      {isLogged && (
          <SaveToListModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            mediaId={movie.id}
            mediaType="movie"
          />
      )}
    </View>
  );
};

export default Details;