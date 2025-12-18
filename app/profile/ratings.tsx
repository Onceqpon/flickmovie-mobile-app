import { useGlobalContext } from "@/context/GlobalProvider";
import { getUserReviews } from "@/services/appwriteapi";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from '@/constants/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from "nativewind";

cssInterop(LinearGradient, {
  className: "style",
});

const Ratings = () => {
  const { user } = useGlobalContext();
  const [reviews, setReviews] = useState<ReviewDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user) return;
      try {
        const data = await getUserReviews(user.$id);
        setReviews(data);
      } catch (error) {
        console.error("Error fetching user reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [user]);

  const renderItem = ({ item }: { item: ReviewDocument }) => {
    const imageUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
      : "https://via.placeholder.com/100x150";

    const handlePress = () => {
      if (item.movie_id) {
        router.push(`/movies/${item.movie_id}`);
      } else if (item.series_id) {
        router.push(`/tvseries/${item.series_id}`);
      }
    };

    return (
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
        className="flex-row bg-black-100 p-3 mb-4 rounded-2xl border border-black-200 shadow-sm bg-white/10"
      >
        <Image
          source={{ uri: imageUrl }}
          className="w-[70px] h-[105px] rounded-xl"
          resizeMode="cover"
        />

        <View className="flex-1 ml-4 justify-between py-1 ">
            <View>
                <View className="flex-row justify-between items-start">
                    <Text className="text-white font-psemibold text-lg flex-1 mr-2 leading-6" numberOfLines={2}>
                        {item.title || "Unknown Title"}
                    </Text>
                    <Text className="text-gray-400 text-xs font-pregular mt-1">
                        {new Date(item.$createdAt).toLocaleDateString()}
                    </Text>
                </View>
                
                <View className="flex-row my-2 bg-black-200/50 self-start px-2 py-1 rounded-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesome
                        key={star}
                        name={star <= item.rating ? "star" : "star-o"}
                        size={12}
                        color="#FFA001"
                        style={{ marginRight: 2 }}
                    />
                    ))}
                    <Text className="text-gray-300 text-xs ml-2 font-pmedium">{item.rating}/5</Text>
                </View>
            </View>

            {item.content ? (
                <Text className="text-gray-100 text-sm font-pregular leading-5" numberOfLines={2} ellipsizeMode="tail">
                    {item.content}
                </Text>
            ) : (
                <Text className="text-gray-500 text-xs italic">No written review</Text>
            )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    // ZMIANA 1: Główny kontener to View
    <View className="flex-1 bg-[#1E1E2D]">
      
      {/* ZMIANA 2: Gradient obejmuje cały ekran (wchodzi pod pasek na dole) */}
      <LinearGradient
          colors={["#000C1C", "#161622", "#1E1E2D"]}
          className="absolute w-full h-full"
        />

      {/* ZMIANA 3: SafeAreaView wewnątrz, chroni treść */}
      <SafeAreaView className="flex-1">
          <View className="flex-row items-center px-4 my-6">
            <TouchableOpacity 
                onPress={() => router.back()} 
                className="bg-black-100 p-2 rounded-full mr-4 border border-black-200 "
            >
                <Image
                    source={icons.left_arrow || icons.angle_left}
                    className="w-5 h-5"
                    resizeMode="contain"
                    tintColor="white"
                />
            </TouchableOpacity>
            <Text className="text-2xl font-psemibold text-white">Your Ratings</Text>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#FFA001" />
            </View>
          ) : (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.$id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
              ListEmptyComponent={() => (
                <View className="flex-1 justify-center items-center mt-20 px-4">
                  <Image 
                      source={icons.star} 
                      className="w-16 h-16 mb-4 opacity-20" 
                      tintColor="white" 
                      resizeMode="contain"
                  />
                  <Text className="text-white text-xl font-psemibold mb-2">No ratings yet</Text>
                  <Text className="text-gray-100 text-center font-pregular">
                    Start rating movies and TV series to keep track of what you ve watched!
                  </Text>
                </View>
              )}
            />
          )}
      </SafeAreaView>
    </View>
  );
};

export default Ratings;