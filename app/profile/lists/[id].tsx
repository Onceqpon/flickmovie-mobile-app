import { LinearGradient } from 'expo-linear-gradient'; // 1. Import
import { router, useLocalSearchParams } from 'expo-router';
import { cssInterop } from "nativewind"; // 2. Import
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../../constants/icons';
import { getListDetails, removeItemFromList } from '../../../services/appwriteapi';
import { fetchMovieDetails, fetchTVSeriesDetails } from '../../../services/tmdbapi';

// 3. Konfiguracja NativeWind
cssInterop(LinearGradient, {
  className: "style",
});

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const ListDetails = () => {
  const { id } = useLocalSearchParams();
  const listId = Array.isArray(id) ? id[0] : id;

  const [listData, setListData] = useState<any>(null);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (listId) {
      loadListAndMedia();
    }
  }, [listId]);

  const loadListAndMedia = async () => {
    setLoading(true);
    try {
      const listDoc = await getListDetails(listId!);
      setListData(listDoc);

      const items = listDoc.items || [];
      
      const promises = items.map(async (itemStr: string) => {
        const [type, mediaId] = itemStr.split(':');
        
        try {
          let details;
          if (type === 'movie') {
            details = await fetchMovieDetails(mediaId);
            return { ...details, mediaType: 'movie', uniqueId: itemStr }; 
          } else {
            details = await fetchTVSeriesDetails(mediaId);
            return { ...details, mediaType: 'tv', uniqueId: itemStr };
          }
        } catch (err) {
          console.error(`Failed to load media ${mediaId}`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      setMediaItems(results.filter(item => item !== null));

    } catch (error) {
      Alert.alert("Error", "Nie udało się załadować zawartości listy.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (uniqueId: string, title: string) => {
    Alert.alert(
      "Usuń z listy",
      `Czy na pewno chcesz usunąć "${title}"?`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            try {
              const [type, mediaId] = uniqueId.split(':');
              await removeItemFromList(listId!, mediaId, type as 'movie' | 'tv');
              
              setMediaItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
              
            } catch (error) {
              Alert.alert("Błąd", "Nie udało się usunąć elementu.");
            }
          }
        }
      ]
    );
  };

  const handlePressMedia = (item: any) => {
    if (item.mediaType === 'movie') {
      router.push(`/movies/${item.id}`);
    } else {
      router.push(`/tvseries/${item.id}`);
    }
  };

  return (
    // 4. Główny kontener View z fallbackiem koloru
    <View className="flex-1 bg-[#1E1E2D]">
      
      {/* 5. Gradient Tła */}
      <LinearGradient
          colors={["#000C1C", "#161622", "#1E1E2D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="absolute top-0 left-0 right-0 bottom-0 h-full w-full"
          style={{ zIndex: -1 }}
      />

      {/* 6. Treść wewnątrz SafeAreaView */}
      <SafeAreaView className="flex-1">
        {/* --- NAGŁÓWEK --- */}
        <View className="px-4 my-4 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="bg-black-100 p-2 rounded-full mr-4"
          >
             <Image source={icons.angle_left} className="w-5 h-5" tintColor="white" resizeMode="contain" />
          </TouchableOpacity>
          
          <View className="flex-1">
              <Text className="text-xl text-white font-psemibold" numberOfLines={1}>
                  {listData?.name || 'Szczegóły listy'}
              </Text>
              {listData?.description ? (
                  <Text className="text-gray-100 text-xs mt-1" numberOfLines={1}>
                      {listData.description}
                  </Text>
              ) : null}
          </View>
        </View>

        {/* --- ZAWARTOŚĆ --- */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#FF9C01" />
          </View>
        ) : (
          <FlatList
            data={mediaItems}
            keyExtractor={(item) => item.uniqueId}
            numColumns={2} 
            contentContainerStyle={{ padding: 16 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                  className="w-[48%] mb-6 relative"
                  onPress={() => handlePressMedia(item)}
                  activeOpacity={0.7}
              >
                  {/* Plakat */}
                  <Image
                      source={{
                          uri: item.poster_path 
                              ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
                              : 'https://placehold.co/600x900/1a1a1a/FFFFFF.png'
                      }}
                      className="w-full h-64 rounded-xl mb-2"
                      resizeMode="cover"
                  />

                  {/* Przycisk usuwania (mały kosz w rogu plakatu) */}
                  <TouchableOpacity 
                      onPress={() => handleRemoveItem(item.uniqueId, item.title || item.name)}
                      className="absolute top-2 right-2 bg-black/60 p-2 rounded-full"
                  >
                      <Image source={icons.trash || icons.close} className="w-4 h-4" tintColor="#FF4444" />
                  </TouchableOpacity>

                  {/* Tytuł i ocena */}
                  <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
                      {item.title || item.name}
                  </Text>
                  
                  <View className="flex-row items-center mt-1">
                      <Image source={icons.star} className="w-3 h-3 mr-1" tintColor="#FF9C01" />
                      <Text className="text-gray-100 text-xs">
                          {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                      </Text>
                      <Text className="text-gray-100 text-xs ml-2 capitalize">
                          • {item.mediaType === 'movie' ? 'Film' : 'Serial'}
                      </Text>
                  </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View className="items-center mt-20">
                  <Image source={icons.clapperboard || icons.play} className="w-16 h-16 opacity-20 mb-4" tintColor="white" />
                  <Text className="text-gray-100 font-pmedium">Ta lista jest pusta.</Text>
                  <Text className="text-gray-100 text-xs mt-2">Dodaj filmy klikając zakładkę przy filmie.</Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default ListDetails;