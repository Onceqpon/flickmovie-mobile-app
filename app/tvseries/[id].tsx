import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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
import { fetchSeasonDetails, fetchTVSeriesDetails } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";
import SaveToListModal from '../../components/SaveToListModal'; // <--- IMPORT

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface SeriesInfoProps {
  label: string;
  value?: string | number | null;
}

const SeriesInfo = ({ label, value }: SeriesInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-white font-normal text-sm">{label}</Text>
    <Text className="text-white font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const seriesId = Array.isArray(id) ? id[0] : (id as string | undefined);
  const shouldFetch = !!seriesId;

  // --- STATE DLA MODALA ---
  const [modalVisible, setModalVisible] = useState(false);

  const [expandedSeasonId, setExpandedSeasonId] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  const { data: series, loading, error } = useLoadData(
    () => fetchTVSeriesDetails(seriesId!),
    [seriesId],
    shouldFetch
  );

  const handleSeasonPress = async (seasonNumber: number, seasonId: number) => {
    if (!seriesId) return;

    if (expandedSeasonId === seasonId) {
      setExpandedSeasonId(null);
      return;
    }

    setExpandedSeasonId(seasonId);
    setEpisodesLoading(true);
    setEpisodes([]);

    try {
      const data = await fetchSeasonDetails(Number(seriesId), seasonNumber);
      if (data && data.episodes) {
        setEpisodes(data.episodes);
      } else {
        setEpisodes([]);
      }
    } catch (error) {
      setEpisodes([]);
    } finally {
      setEpisodesLoading(false);
    }
  };

  if (!seriesId) {
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <Text className="text-white text-lg">Brak ID serialu.</Text>
        <TouchableOpacity onPress={router.back}>
          <Text className="text-accent mt-4">Wróć</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF8C00" />
      </SafeAreaView>
    );

  if (error) {
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">Błąd: {error.message}</Text>
        <TouchableOpacity onPress={router.back}>
          <Text className="text-accent mt-4">Wróć</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!series) {
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <Text className="text-white text-lg">Serial nie znaleziony.</Text>
        <TouchableOpacity onPress={router.back}>
          <Text className="text-accent mt-4">Wróć</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="bg-movie-card-bg flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: `${TMDB_IMAGE_BASE_URL}${series.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />

          {/* --- Kontener Przycisków Akcji --- */}
          <View className="absolute bottom-5 right-5 flex-row gap-4">
            
            {/* Przycisk Watchlist */}
            <View className="rounded-full size-14 bg-white flex items-center justify-center shadow-lg">
              <WatchlistButton 
                item={{
                  id: series.id,
                  name: series.name,
                  poster_path: series.poster_path || "",
                  vote_average: series.vote_average || 0
                }} 
                type="series"
              />
            </View>

            {/* --- NOWY PRZYCISK: Dodaj do Listy --- */}
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              className="rounded-full size-14 bg-white flex items-center justify-center shadow-lg"
              activeOpacity={0.8}
            >
               <Image 
                 source={icons.plus} 
                 className="size-6" 
                 resizeMode="contain" 
                 tintColor="#FF9C01" // Pomarańczowy akcent
               />
            </TouchableOpacity>

          </View>
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{series.name}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-white text-sm">
              {series.first_air_date?.split("-")[0]} •
            </Text>
            <Text className="text-white text-sm">
              {series.number_of_seasons} Seasons
            </Text>
          </View>

          <View className="flex-row items-center bg-star-bg px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" tintColor="#FFD700" />

            <Text className="text-white font-bold text-sm">
              {Math.round(series.vote_average ?? 0)}/10
            </Text>

            <Text className="text-white text-sm">
              ({series.vote_count} votes)
            </Text>
          </View>

          <SeriesInfo label="Overview" value={series.overview} />
          <SeriesInfo
            label="Genres"
            value={series.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-full">
            <SeriesInfo
              label="Total Episodes"
              value={series.number_of_episodes}
            />
            <SeriesInfo label="Status" value={series.status} />
          </View>

          <SeriesInfo
            label="Networks"
            value={series.networks?.map((c) => c.name).join(" • ") || "N/A"}
          />

          <View className="mt-8 w-full">
            <Text className="text-white font-bold text-lg mb-4">Seasons</Text>

            {series.seasons && series.seasons.length > 0 ? (
              series.seasons.map((season) => (
                <View key={season.id} className="mb-4">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSeasonPress(season.season_number, season.id)}
                    className="flex-row p-3 rounded-xl items-center"
                    style={{
                        backgroundColor: expandedSeasonId === season.id ? "#374151" : "#1E1E2D"
                    }}
                  >
                    <Image
                      source={{
                        uri: season.poster_path
                          ? `${TMDB_IMAGE_BASE_URL}${season.poster_path}`
                          : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
                      }}
                      className="w-20 h-28 rounded-lg"
                      resizeMode="cover"
                    />

                    <View className="ml-4 flex-1">
                      <Text className="text-white font-bold text-lg">
                        {season.name}
                      </Text>

                      <View className="flex-row items-center mt-1 gap-x-2">
                        <Text className="text-accent font-semibold text-white text-sm">
                          {season.episode_count} Episodes
                        </Text>
                        {season.air_date && (
                          <Text className="text-gray-400 text-xs">
                            ({season.air_date.split("-")[0]})
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {expandedSeasonId === season.id && (
                    <View className="bg-gray-900 rounded-b-xl p-3 mt-1 mx-1">
                      {episodesLoading ? (
                        <ActivityIndicator
                          size="small"
                          color="#FF8C00"
                          className="py-4"
                        />
                      ) : (
                        episodes.map((ep) => (
                          <View
                            key={ep.id}
                            className="flex-row items-center py-3 border-b border-gray-800"
                          >
                            <Image
                              source={{
                                uri: ep.still_path
                                  ? `${TMDB_IMAGE_BASE_URL}${ep.still_path}`
                                  : "https://placehold.co/100x60/333/fff.png",
                              }}
                              className="w-24 h-14 rounded mr-3"
                              resizeMode="cover"
                            />

                            <View className="flex-1">
                              <Text className="text-white font-bold text-sm">
                                {ep.episode_number}. {ep.name}
                              </Text>
                              <View className="flex-row justify-between mt-1">
                                <Text className="text-gray-400 text-xs">
                                  {ep.air_date}
                                </Text>
                                <View className="flex-row items-center">
                                  <Image
                                    source={icons.star}
                                    className="size-3 mr-1"
                                    tintColor="#FFD700"
                                  />
                                  <Text className="text-white text-xs">
                                    {ep.vote_average.toFixed(1)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text className="text-gray-400">
                No season information available.
              </Text>
            )}
          </View>
        </View>
        <Reviews seriesId={Number(id)} title={series.name} posterPath={series.poster_path || ""} />
      </ScrollView>

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
        mediaId={series.id}
        mediaType="tv" // <--- WAŻNE: typ 'tv'
      />
    </View>
  );
};

export default Details;