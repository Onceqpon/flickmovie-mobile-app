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
import { icons } from "@/constants/icons";
import { fetchSeasonDetails, fetchTVSeriesDetails } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";
// 1. IMPORTUJEMY KONTEKST
import { useGlobalContext } from "@/context/GlobalProvider";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Konfiguracja nativewind dla gradientu
cssInterop(LinearGradient, {
  className: "style",
});

// Komponent do wyświetlania pojedynczej informacji
interface SeriesInfoProps {
  label: string;
  value?: string | number | null;
}

const SeriesInfo = ({ label, value }: SeriesInfoProps) => (
  <View className="mb-4">
    <Text className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</Text>
    <Text className="text-white font-semibold text-base">
      {value || "N/A"}
    </Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  // 2. POBIERAMY STATUS LOGOWANIA
  const { isLogged } = useGlobalContext();

  const seriesId = Array.isArray(id) ? id[0] : (id as string | undefined);
  const shouldFetch = !!seriesId;

  // --- STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedSeasonId, setExpandedSeasonId] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // Pobieranie danych serialu
  const { data: series, loading, error } = useLoadData(
    () => fetchTVSeriesDetails(seriesId!),
    [seriesId],
    shouldFetch
  );

  // Obsługa kliknięcia w sezon
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

  if (!seriesId) return null;

  // Loading State z Gradientem
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

  // Error State z Gradientem
  if (error || !series) {
    return (
      <View className="flex-1 justify-center items-center">
        <LinearGradient
            colors={["#000C1C", "#161622", "#1E1E2D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="absolute w-full h-full"
        />
        <Text className="text-red-500 text-lg mb-4">
          {error ? `Error: ${error.message}` : "Series not found"}
        </Text>
        <TouchableOpacity onPress={router.back}>
          <Text className="text-secondary font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    // GLÓWNY WIDOK
    <View className="flex-1">
      
      {/* 1. GŁÓWNE TŁO APLIKACJI (Fixed Gradient) */}
      <LinearGradient
        colors={["#000C1C", "#161622", "#1E1E2D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute top-0 left-0 right-0 bottom-0 h-full w-full"
      />

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER: PLAKAT + GRADIENT --- */}
        <View className="relative w-full h-[550px]">
          <Image
            source={{
              uri: `${TMDB_IMAGE_BASE_URL}${series.poster_path}`,
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          
          {/* 2. GRADIENT POD PLAKATEM (Fade to match background) */}
          <LinearGradient
            colors={["transparent", "#161622"]} 
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 350 }}
          />

          {/* 3. WARUNEK DLA PRZYCISKÓW (Tylko dla zalogowanych) */}
          {isLogged && (
             <View className="absolute bottom-10 right-5 flex-row gap-4 z-10">
                 <View className="rounded-full size-14 bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
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

                 <TouchableOpacity 
                    onPress={() => setModalVisible(true)}
                    className="rounded-full size-14 bg-secondary flex items-center justify-center shadow-lg shadow-secondary/30"
                    activeOpacity={0.8}
                 >
                    <Image 
                      source={icons.plus} 
                      className="size-7" 
                      resizeMode="contain" 
                      tintColor="#161622" 
                    />
                 </TouchableOpacity>
             </View>
          )}
        </View>

        {/* --- TREŚĆ --- */}
        <View className="px-5 -mt-6">
          <Text className="text-white font-black text-3xl mb-2 leading-tight">
            {series.name}
          </Text>

          {/* Meta Info */}
          <View className="flex-row items-center flex-wrap gap-3 mb-5">
            <Text className="text-gray-300 font-medium">
              {series.first_air_date?.split("-")[0]}
            </Text>
            <View className="w-1 h-1 bg-gray-500 rounded-full" />
            <Text className="text-gray-300 font-medium">
              {series.number_of_seasons} {series.number_of_seasons === 1 ? 'Season' : 'Seasons'}
            </Text>
            <View className="w-1 h-1 bg-gray-500 rounded-full" />
            <View className="flex-row items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-xs">
               <Image source={icons.star} className="size-3.5" tintColor="#FF9C01" />
               <Text className="text-secondary font-bold">{series.vote_average?.toFixed(1)}</Text>
            </View>
          </View>

          {/* Gatunki */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            {series.genres?.map((g) => (
              <View key={g.id} className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Text className="text-gray-300 text-xs font-medium">{g.name}</Text>
              </View>
            ))}
          </View>

          {/* Opis */}
          <Text className="text-white font-bold text-lg mb-2">Overview</Text>
          <Text className="text-gray-300 text-base leading-6 mb-6">
            {series.overview}
          </Text>

          {/* Info Grid */}
          <View className="flex-row justify-between bg-white/5 p-4 rounded-2xl mb-8 border border-white/10">
             <View className="flex-1 mr-2">
                <SeriesInfo label="Episodes" value={series.number_of_episodes} />
                <SeriesInfo label="Status" value={series.status} />
             </View>
             <View className="flex-1">
                <SeriesInfo label="Network" value={series.networks?.[0]?.name} />
                <SeriesInfo 
                   label="Production" 
                   value={series.production_companies?.[0]?.name} 
                />
             </View>
          </View>

          {/* --- SEZONY --- */}
          <Text className="text-white font-bold text-xl mb-4">Seasons</Text>
          <View className="gap-y-4 mb-8">
            {series.seasons && series.seasons.length > 0 ? (
              series.seasons.map((season) => (
                <View 
                  key={season.id} 
                  className={`rounded-2xl overflow-hidden border ${expandedSeasonId === season.id ? 'border-secondary/50 bg-white/5' : 'border-transparent bg-white/5'}`}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSeasonPress(season.season_number, season.id)}
                    className="flex-row p-3"
                  >
                    <Image
                      source={{
                        uri: season.poster_path
                          ? `${TMDB_IMAGE_BASE_URL}${season.poster_path}`
                          : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
                      }}
                      className="w-20 h-28 rounded-xl bg-gray-800"
                      resizeMode="cover"
                    />

                    <View className="ml-4 flex-1 justify-center">
                      <Text className="text-white font-bold text-lg">
                        {season.name}
                      </Text>
                      
                      <View className="flex-row items-center mt-1 gap-2">
                        <Text className="text-secondary font-semibold text-sm">
                          {season.episode_count} Episodes
                        </Text>
                        {season.air_date && (
                           <Text className="text-gray-500 text-xs">
                             | {season.air_date.split("-")[0]}
                           </Text>
                        )}
                      </View>
                      
                      <Text className="text-gray-500 text-xs mt-3 uppercase font-bold tracking-widest">
                         {expandedSeasonId === season.id ? "Hide Episodes" : "Show Episodes"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Accordion Episodes */}
                  {expandedSeasonId === season.id && (
                    <View className="bg-black/20 p-2 border-t border-white/10">
                      {episodesLoading ? (
                        <ActivityIndicator size="small" color="#FF9C01" className="py-4" />
                      ) : (
                        episodes.map((ep) => (
                          <View
                            key={ep.id}
                            className="flex-row items-center p-2 mb-1 rounded-lg hover:bg-white/5"
                          >
                            <Image
                              source={{
                                uri: ep.still_path
                                  ? `${TMDB_IMAGE_BASE_URL}${ep.still_path}`
                                  : "https://placehold.co/100x60/333/fff.png",
                              }}
                              className="w-28 h-16 rounded-lg bg-gray-800 mr-3"
                              resizeMode="cover"
                            />
                            <View className="flex-1">
                              <Text className="text-white font-bold text-sm" numberOfLines={1}>
                                {ep.episode_number}. {ep.name}
                              </Text>
                              <View className="flex-row justify-between items-center mt-1">
                                <Text className="text-gray-500 text-xs">{ep.air_date}</Text>
                                {ep.vote_average > 0 && (
                                  <View className="flex-row items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                                     <Image source={icons.star} className="size-2.5" tintColor="#FF9C01" />
                                     <Text className="text-gray-300 text-[10px] font-bold">{ep.vote_average.toFixed(1)}</Text>
                                  </View>
                                )}
                              </View>
                              <Text className="text-gray-400 text-xs mt-1 line-clamp-2" numberOfLines={2}>
                                {ep.overview}
                              </Text>
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
               <View className="p-4 bg-white/5 rounded-xl">
                 <Text className="text-gray-400 text-center">No season info available.</Text>
               </View>
            )}
          </View>
        </View>

        <Reviews seriesId={Number(id)} title={series.name} posterPath={series.poster_path || ""} />
      </ScrollView>

      {/* BACK BUTTON */}
      <TouchableOpacity
        className="absolute top-14 left-5 bg-black/40 backdrop-blur-md rounded-full p-2.5 z-50 border border-white/10"
        onPress={router.back}
      >
        <Image
          source={icons.angle_left}
          className="size-6"
          resizeMode="contain"
          tintColor="#FFFFFF"
        />
      </TouchableOpacity>

      {/* MODAL (Pokaż tylko dla zalogowanych) */}
      {isLogged && (
          <SaveToListModal 
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            mediaId={series.id}
            mediaType="tv"
          />
      )}
    </View>
  );
};

export default Details;