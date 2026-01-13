import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";

interface MovieCardProps extends Movie {
  onPress?: () => void;
  className?: string;
}

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  onPress,
  className,
}: MovieCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    router.push(`/movies/${id}`);
  };

  return (
    <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.7}
        className={`rounded-lg ${className || ""}`}
    >
      <Image
        source={{
          uri: poster_path
            ? `https://image.tmdb.org/t/p/w500${poster_path}`
            : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
        }}
        className="w-full h-52 rounded-lg"
        resizeMode="cover"
      />

      <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
        {title}
      </Text>

      <View className="flex-row items-center justify-start gap-x-1">
        <Image 
            source={icons.star} 
            className="w-4 h-4" 
            tintColor="#FFD700"
            resizeMode="contain"
        />
        <Text className="text-xs text-white font-bold uppercase">
          {vote_average ? vote_average.toFixed(1) : "N/A"}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-white font-medium mt-1">
          {release_date ? release_date.split("-")[0] : "N/A"}
        </Text>
        <Text className="text-xs font-medium text-white uppercase">
          Movie
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MovieCard;