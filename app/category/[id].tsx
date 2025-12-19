import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { cssInterop } from "nativewind"; // DODANO
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Importy komponentów i serwisów
import MovieCard from "@/components/MovieCard";
import TVSeriesCard from "@/components/TVSeriesCard";
import { icons } from "@/constants/icons";
import { fetchMovies, fetchTVSeries } from "@/services/tmdbapi";

// Konfiguracja Gradientu
cssInterop(LinearGradient, {
  className: "style",
});

// --- KONFIGURACJA WYMIARÓW ---
const { width } = Dimensions.get("window");
const COLUMNS = 2;
const PADDING_HORIZONTAL = 16;
const GAP = 14; 

const ITEM_WIDTH = (width - (PADDING_HORIZONTAL * 2) - GAP) / COLUMNS;
const ASPECT_RATIO = 2 / 3;

const CategoryList = () => {
  const { id, name, type } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const isTv = type === 'tv';

  useEffect(() => {
    loadData();
    // Przewiń na górę przy zmianie strony
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [page, id, type]);

  const loadData = async () => {
    if (page === 1) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      // 1. Sprawdzamy czy ID to liczba (Gatunek) czy tekst (Sortowanie)
      const paramId = Array.isArray(id) ? id[0] : id;
      const isGenre = !isNaN(Number(paramId));

      // 2. Przygotowujemy parametry zapytania
      let apiParams: any = { page: page };

      if (isGenre) {
        // To jest kategoria (np. Action, id: 28)
        apiParams.genreId = paramId;
      } else {
        // To jest lista specjalna (np. Popular, id: 'popularity.desc')
        apiParams.sortBy = paramId === 'popular' ? 'popularity.desc' : paramId;
      }

      let result = [];
      if (isTv) {
        result = await fetchTVSeries(apiParams);
      } else {
        result = await fetchMovies(apiParams);
      }
      setDataList(result);
    } catch (error) {
      console.error("Error loading category data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    // Główny kontener z ciemnym tłem (eliminuje błyski)
    <View className="flex-1 bg-[#000C1C]">
      
      {/* GLOBALNE TŁO GRADIENTOWE */}
      <LinearGradient
        colors={["#000C1C", "#161622", "#1E1E2D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute w-full h-full"
      />

      <SafeAreaView className="flex-1">
        
        {/* --- HEADER --- */}
        <View className="px-4 pt-2 pb-4 flex-row items-center justify-between z-10">
          <View>
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-10 h-10 bg-white/10 rounded-full justify-center items-center border border-white/10"
              activeOpacity={0.7}
            >
              <Image 
                source={icons.angle_left} 
                className="w-5 h-5" 
                tintColor="white" 
                resizeMode="contain" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mb-6">
            <Text className="text-4xl font-black text-white tracking-tighter" numberOfLines={2}>
              {name}
            </Text>
            <Text className="text-secondary text-lg font-bold uppercase tracking-widest opacity-80 mt-1">
              {isTv ? "TV Series" : "Movies"}
            </Text>
        </View>

        {/* --- LISTA --- */}
        {loading && page === 1 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF9C01" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={dataList}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            numColumns={COLUMNS}
            showsVerticalScrollIndicator={false}
            
            // Optymalizacja renderowania
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}

            contentContainerStyle={{ 
              paddingHorizontal: PADDING_HORIZONTAL, 
              paddingBottom: 120, 
              gap: GAP 
            }}
            
            columnWrapperStyle={{ 
              justifyContent: 'space-between' 
            }} 
            
            renderItem={({ item }) => (
              <View 
                style={{ 
                  width: ITEM_WIDTH, 
                  height: ITEM_WIDTH / ASPECT_RATIO,
                  // Cienie usunięte z View, bo MovieCard/TVSeriesCard mają swoje style
                }}
              >
                  {isTv ? (
                      <TVSeriesCard 
                        {...item} 
                        className="w-full h-full rounded-2xl border border-white/5" 
                      />
                  ) : (
                      <MovieCard 
                        {...item} 
                        className="w-full h-full rounded-2xl border border-white/5" 
                      />
                  )}
              </View>
            )}
            
            // --- PAGINACJA ---
            ListFooterComponent={() => (
              <View className="mt-10 mb-6 items-center">
                 <View className="flex-row items-center bg-white/10 px-2 py-2 rounded-full border border-white/10">
                    
                    <TouchableOpacity 
                      onPress={handlePrevPage} 
                      disabled={page === 1}
                      className={`w-12 h-12 rounded-full items-center justify-center ${page === 1 ? 'opacity-20' : 'bg-white/10'}`}
                    >
                      <Image source={icons.angle_left} className="w-5 h-5" tintColor="white" />
                    </TouchableOpacity>

                    <View className="mx-6 items-center">
                        <Text className="text-white/50 text-xs font-bold uppercase tracking-widest">Page</Text>
                        <Text className="text-secondary text-xl font-black">{page}</Text>
                    </View>

                    <TouchableOpacity 
                      onPress={handleNextPage}
                      className="w-12 h-12 rounded-full bg-secondary items-center justify-center shadow-lg shadow-secondary/50"
                    >
                        <Image 
                        source={icons.angle_left} 
                        className="w-5 h-5 rotate-180" 
                        tintColor="#000C1C" 
                      />
                    </TouchableOpacity>

                 </View>
                 
                 {isRefreshing && (
                   <ActivityIndicator size="small" color="#FF9C01" className="mt-4" />
                 )}
              </View>
            )}
          />
        )}
      </SafeAreaView>
      
      {/* Transparentny pasek statusu, aby gradient wchodził pod spód */}
      <StatusBar style="light" backgroundColor="transparent" translucent />
    </View>
  );
};

export default CategoryList;