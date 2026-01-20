import { icons } from "@/constants/icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameWelcomeScreen() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const safeNavigate = (path: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    router.push(path as any);

    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  const handleSoloPress = () => {
    safeNavigate("/game/singleplayer/setup");
  };

  const handleGroupPress = () => {
    if (isNavigating) return;

    Alert.alert(
      "Multiplayer Mode",
      "Do you want to host a new game or join an existing party?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Join Game",
          onPress: () => safeNavigate("/game/multiplayer/join")
        },
        {
          text: "Host Game",
          onPress: () => safeNavigate("/game/multiplayer/create")
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-primary">
      <LinearGradient
        colors={["#000C1C", "#161622", "#1E1E2D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute w-full h-full"
      />

      <SafeAreaView className="flex-1 px-6 justify-center">
        <StatusBar style="light" />

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

        <View className="gap-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSoloPress}
            disabled={isNavigating}
            className="w-full bg-black-100 border-2 border-secondary/50 rounded-3xl p-6 flex-row items-center justify-between shadow-lg shadow-black/40"
          >
            <View className="flex-1 mr-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl text-white font-bold mr-2">Solo</Text>
                <View className="bg-secondary/20 px-2 py-1 rounded-md">
                  <Text className="text-secondary text-xs font-bold uppercase">Classic</Text>
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

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGroupPress}
            disabled={isNavigating}
            className="w-full bg-black-100 border-2 border-secondary rounded-3xl p-6 flex-row items-center justify-between shadow-lg shadow-orange-500/20"
          >
            <View className="flex-1 mr-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl text-white font-bold mr-2">With Friends</Text>
                <View className="bg-secondary px-2 py-1 rounded-md border border-secondary">
                  <Text className="text-primary text-xs font-black uppercase">NEW</Text>
                </View>
              </View>
              <Text className="text-gray-300 text-sm leading-5">
                Connect phones and match movies together. No more fighting over the remote!
              </Text>
            </View>
            
            <View className="w-14 h-14 bg-secondary rounded-full items-center justify-center shadow-md shadow-secondary/50">
              <Image 
                source={icons.people}
                className="w-6 h-6" 
                tintColor="white" 
              />
            </View>
          </TouchableOpacity>
        </View>

        <View className="absolute bottom-8 left-0 right-0 items-center gap-4">
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)' as any)}
            disabled={isNavigating}
            className="px-8 py-3 bg-white/5 rounded-full border border-white/10"
          >
            <Text className="text-white font-bold text-sm uppercase tracking-widest">Back</Text>
          </TouchableOpacity>

          <Text className="text-gray-600 text-xs font-pregular">
            Powered by TMDb & JustWatch
          </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}