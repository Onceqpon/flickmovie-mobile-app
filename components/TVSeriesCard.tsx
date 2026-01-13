import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";

interface TVSeriesCardProps {
  id: number;
  poster_path: string | null; 
  name: string;
  vote_average: number;
  first_air_date: string;
  onPress?: () => void;
  className?: string;
}

const TVSeriesCard = ({
  id,
  poster_path,
  name,
  vote_average,
  first_air_date,
  onPress,
  className,
}: TVSeriesCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push(`/tvseries/${id}`);
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
        {name} 
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
          {first_air_date ? first_air_date.split("-")[0] : "N/A"}
        </Text>
        
        <Text className="text-xs font-medium text-white uppercase">
          TV Series
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TVSeriesCard;