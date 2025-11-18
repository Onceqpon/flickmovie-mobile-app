import { images } from "@/constants/images";
import { ImageBackground, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <ImageBackground 
        source={images.mainbg}
        className="flex-1 w-full items-center justify-center"
        >
        <Text className="font-bold text-3xl text-white">Home screen</Text>
      </ImageBackground>
    </View>
  );
}
