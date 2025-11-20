import MaskedView from "@react-native-masked-view/masked-view";
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { images } from "@/constants/images";

interface TrendingSeriesCardProps {
  series: TrendingSeries;
  index: number;
}

const TrendingTVSeriesCard = ({
  series: { series_id, name, poster_url },
  index,
}: TrendingSeriesCardProps) => {
  return (
    <Link href={`/tvseries/${series_id}`} asChild>
      <TouchableOpacity className="w-32 relative pl-5">
        <Image
          source={{ uri: poster_url }}
          className="w-32 h-48 rounded-lg"
          resizeMode="cover"
        />

        <View className="absolute bottom-9 -left-3.5 px-2 py-1 rounded-full">
          <MaskedView
            maskElement={
              <Text className="font-bold text-white text-6xl">{index + 1}</Text>
            }
          >
            <Image
              source={images.btbackground} // Używamy tego samego tła dla numerka co w filmach
              className="size-14"
              resizeMode="cover"
            />
          </MaskedView>
        </View>

        <Text
          className="text-sm font-bold mt-2 text-white"
          numberOfLines={2}
        >
          {name}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

export default TrendingTVSeriesCard;