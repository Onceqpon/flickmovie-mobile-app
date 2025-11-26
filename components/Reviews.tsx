import { useGlobalContext } from "@/context/GlobalProvider";
import { createReview, deleteReview, getReviews, updateReview } from "@/services/appwriteapi";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ReviewsProps {
  movieId?: number;
  seriesId?: number;
  title: string;        
  posterPath: string;   
}

const Reviews = ({ movieId, seriesId, title, posterPath }: ReviewsProps) => {
  const { user } = useGlobalContext();
  const [reviews, setReviews] = useState<ReviewDocument[]>([]);
  const [userReview, setUserReview] = useState<ReviewDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const contentId = movieId || seriesId;
  const contentType = movieId ? "movie" : "series";

  const fetchReviews = async () => {
    if (!contentId) return;
    try {
      const data = await getReviews(contentId, contentType);
      setReviews(data);
      
      if (user) {
        const existingReview = data.find((r) => r.user_id === user.$id);
        if (existingReview) {
          setUserReview(existingReview);
          setRating(existingReview.rating);
          setContent(existingReview.content);
        } else {
          setUserReview(null);
          setRating(0);
          setContent("");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [contentId, user]);

  const handleSubmit = async () => {
    if (!user || !contentId) return;
    
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating.");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Error", "Please write a review.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && userReview) {
        await updateReview(userReview.$id, rating, content);
        Alert.alert("Success", "Review updated successfully");
        setIsEditing(false);
      } else {
        await createReview(
          contentId,
          contentType,
          user.$id,
          user.name,
          (user.prefs as any).avatar || "",
          rating,
          content,
          title,       
          posterPath 
        );
        Alert.alert("Success", "Review posted successfully");
      }
      await fetchReviews();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = () => {
     if (!userReview) return;
     Alert.alert(
      "Delete Review",
      "Are you sure you want to delete your review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setSubmitting(true);
            try {
              await deleteReview(userReview.$id);
              setUserReview(null);
              setRating(0);
              setContent("");
              setIsEditing(false);
              await fetchReviews();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
     // ... (kod z poprzedniej wersji)
     return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && setRating(star)}
            disabled={!interactive}
          >
            <FontAwesome
              name={star <= currentRating ? "star" : "star-o"}
              size={interactive ? 30 : 16}
              color="#FFD700"
              style={{ marginRight: 4 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderReviewForm = () => (
     // ... (kod z poprzedniej wersji)
     <View className="bg-gray-800 p-4 rounded-xl mb-6">
      <Text className="text-white font-semibold mb-2">
        {isEditing ? "Edit Your Review" : "Write a Review"}
      </Text>
      <View className="mb-4">{renderStars(rating, true)}</View>
      <TextInput
        className="bg-gray-900 text-white p-3 rounded-lg min-h-[80px]"
        placeholder="Share your thoughts..."
        placeholderTextColor="#666"
        multiline
        value={content}
        onChangeText={setContent}
      />
      <View className="flex-row justify-end mt-4 gap-2">
        {isEditing && (
          <TouchableOpacity
            className="bg-gray-600 p-3 rounded-lg"
            onPress={() => setIsEditing(false)}
            disabled={submitting}
          >
            <Text className="text-white font-bold">Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`bg-secondary p-3 rounded-lg flex-1 items-center ${submitting ? "opacity-50" : ""}`}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold">
              {isEditing ? "Update" : "Submit"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="mt-8 px-4 pb-10">
      <Text className="text-white text-xl font-bold mb-4">Reviews</Text>

      {user && !userReview && !loading && renderReviewForm()}
      {user && userReview && isEditing && renderReviewForm()}

      {user && userReview && !isEditing && (
        <View className="bg-gray-800 border-2 border-secondary p-4 rounded-xl mb-6">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-secondary font-bold text-lg">Your Review</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <FontAwesome name="pencil" size={20} color="#FFA001" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <FontAwesome name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="mb-2">{renderStars(userReview.rating)}</View>
          <Text className="text-white">{userReview.content}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : reviews.length > 0 ? (
        reviews
          .filter((r) => r.user_id !== user?.$id)
          .map((item) => (
            <View key={item.$id} className="bg-gray-800 p-4 rounded-xl mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: item.avatar_url || "https://cloud.appwrite.io/v1/storage/buckets/674488390022467d5f0e/files/6744a56a003d76711815/view?project=67447d4e0031804f3299&mode=admin" }}
                    className="w-8 h-8 rounded-full mr-2"
                    resizeMode="cover"
                  />
                  <Text className="text-white font-semibold">{item.username}</Text>
                </View>
                <Text className="text-gray-400 text-xs">
                  {new Date(item.$createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View className="mb-2">{renderStars(item.rating)}</View>
              <Text className="text-gray-300 leading-5">{item.content}</Text>
            </View>
          ))
      ) : (
        !userReview && (
          <Text className="text-gray-400 text-center italic">No reviews yet.</Text>
        )
      )}
    </View>
  );
};

export default Reviews;