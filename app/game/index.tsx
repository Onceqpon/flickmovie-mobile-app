import { icons } from "@/constants/icons";
import { LinearGradient } from "expo-linear-gradient"; // IMPORT GRADIENTU
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameWelcomeScreen() {
  const router = useRouter();

  const handleSoloPress = () => {
    router.push("/game/setup");
  };

  const handleGroupPress = () => {
    Alert.alert("Coming Soon!", "We are working on a mode for couples and groups. Stay tuned for updates!");
  };

  return (
    <View className="flex-1 bg-primary">
        {/* Tło Gradientowe */}
        <LinearGradient
                colors={["#000C1C", "#161622", "#1E1E2D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="absolute w-full h-full"
              />

        <SafeAreaView className="flex-1 px-6 justify-center">
        <StatusBar style="light" />

        {/* HEADER */}
        <View className="items-center mb-10">
            <View className="relative">
                <Text className="text-4xl text-white font-black text-center tracking-wider">
                    FLICK<Text className="text-secondary">MATCH</Text>
                </Text>
                <Image
                    source={icons.path}
                    className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
                    resizeMode="contain"
                />
            </View>
            <Text className="text-gray-400 text-center mt-4 font-medium">
                Choose a mode and find the perfect movie for tonight.
            </Text>
        </View>

        {/* SELECTION CARDS */}
        <View className="gap-6">
            
            {/* SOLO CARD */}
            <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSoloPress}
            className="w-full bg-black-100 border-2 border-secondary/50 rounded-3xl p-6 flex-row items-center justify-between shadow-lg shadow-black/40"
            >
            <View className="flex-1 mr-4">
                <View className="flex-row items-center mb-2">
                    <Text className="text-2xl text-white font-bold mr-2">Solo</Text>
                    <View className="bg-secondary/20 px-2 py-1 rounded-md">
                        <Text className="text-secondary text-xs font-bold uppercase">Now</Text>
                    </View>
                </View>
                <Text className="text-gray-400 text-sm leading-5">
                Build your own watchlist. Swipe cards and discover new titles tailored to you.
                </Text>
            </View>
            
            <View className="w-14 h-14 bg-secondary rounded-full items-center justify-center shadow-md shadow-secondary/50">
                <Image 
                    source={icons.user}
                    className="w-6 h-6" 
                    tintColor="white" 
                />
            </View>
            </TouchableOpacity>

            {/* GROUP CARD */}
            <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleGroupPress}
            className="w-full bg-black-100 border-2 border-gray-800 rounded-3xl p-6 flex-row items-center justify-between opacity-60"
            >
            <View className="flex-1 mr-4">
                <View className="flex-row items-center mb-2">
                    <Text className="text-2xl text-gray-300 font-bold mr-2">With Partner</Text>
                    <View className="bg-gray-700 px-2 py-1 rounded-md border border-gray-600">
                        <Text className="text-gray-300 text-xs font-bold uppercase">Soon</Text>
                    </View>
                </View>
                <Text className="text-gray-500 text-sm leading-5">
                Connect phones and match movies together. No more fighting over the remote!
                </Text>
            </View>
            
            <View className="w-14 h-14 bg-gray-800 rounded-full items-center justify-center border border-gray-700">
                <Image 
                    source={icons.people}
                    className="w-6 h-6 opacity-50" 
                    tintColor="white" 
                />
            </View>
            </TouchableOpacity>

        </View>

        {/* FOOTER */}
        <View className="absolute bottom-10 left-0 right-0 items-center">
            <Text className="text-gray-600 text-xs font-pregular">
                Powered by TMDb & JustWatch
            </Text>
        </View>

        </SafeAreaView>
    </View>
  );
}