import { useGlobalContext } from "@/context/GlobalProvider";
import { getUserReviews } from "@/services/appwriteapi";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        className="flex-row bg-gray-800 p-3 mb-4 rounded-xl overflow-hidden"
      >
        {/* Mała ikona (plakat) */}
        <Image
          source={{ uri: imageUrl }}
          className="w-16 h-24 rounded-lg"
          resizeMode="cover"
        />

        {/* Treść po prawej */}
        <View className="flex-1 ml-4 justify-center">
            {/* Tytuł i Data */}
            <View className="flex-row justify-between items-start">
                <Text className="text-white font-bold text-lg flex-1 mr-2" numberOfLines={1}>
                    {item.title || "Unknown Title"}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                    {new Date(item.$createdAt).toLocaleDateString()}
                </Text>
            </View>
            
            {/* Gwiazdki */}
            <View className="flex-row my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                    key={star}
                    name={star <= item.rating ? "star" : "star-o"}
                    size={14}
                    color="#FFD700"
                    style={{ marginRight: 2 }}
                />
                ))}
            </View>

            {/* Treść recenzji */}
            <Text className="text-gray-300 text-sm" numberOfLines={2} ellipsizeMode="tail">
                {item.content}
            </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary px-4">
      <View className="flex-row items-center mb-6 mt-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <FontAwesome name="angle-left" size={30} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Your Ratings</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.$id}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-gray-400 text-lg">You haven t rated anything yet.</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

export default Ratings;