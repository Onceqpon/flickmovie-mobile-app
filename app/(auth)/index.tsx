import { useGlobalContext } from "@/context/GlobalProvider";
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { cssInterop } from "nativewind";
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(LinearGradient, {
  className: "style",
});

const Welcome = () => {
  const { loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View className="flex-1 bg-[#1E1E2D]">
      <LinearGradient
        colors={["#000C1C", "#161622", "#1E1E2D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute top-0 left-0 right-0 bottom-0 h-full w-full"
      />

      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ height: '100%' }}>
          <View className="w-full justify-center items-center min-h-[85vh] px-4">
            
            <Text className="text-5xl text-white font-black text-center tracking-wider mt-20 mb-5 ">
              FLICK<Text className="text-secondary">MOVIE</Text>
            </Text>

            <Text className="text-3xl text-white font-bold text-center mt-5">
              Discover movies with <Text className="text-secondary">FlickMovie</Text>
            </Text>

            <Text className="text-sm font-regular text-gray-100 mt-7 text-center px-4">
              Join the community, rate movies, and create your own lists. Or just look around as a guest!
            </Text>

            <View className="w-full mt-10 space-y-4">
              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-up')}
                className="bg-secondary rounded-xl min-h-[62px] justify-center items-center w-full"
                activeOpacity={0.7}
              >
                <Text className="text-primary font-bold text-lg">
                  Create Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-in')}
                className="bg-yellow-500 border-2 border-black-200 rounded-xl min-h-[62px] justify-center items-center w-full mt-4"
                activeOpacity={0.7}
              >
                <Text className="text-black font-bold text-lg">
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace('/(tabs)')}
                className="mt-6"
                activeOpacity={0.7}
              >
                <Text className="text-gray-100 text-base font-regular text-center underline">
                  Continue as Guest
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        
        <StatusBar style="light" />
      </SafeAreaView>
    </View>
  );
};

export default Welcome;