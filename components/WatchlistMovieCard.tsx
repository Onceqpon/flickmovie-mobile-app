import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";

interface MovieCardProps {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string; 
  onPress?: () => void;
  className?: string;
}

const WatchlistMovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  onPress,
  className,
}: MovieCardProps) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      className={`rounded-lg w-[30%] ${className || ""}`} 
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
          tintColor="#FF9C01" 
        />
        <Text className="text-xs text-white font-bold uppercase">
          {(vote_average / 2).toFixed(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default WatchlistMovieCard;