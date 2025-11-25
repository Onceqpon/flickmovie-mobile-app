import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';

const Welcome = () => {
  return (
    <SafeAreaView className="bg-primary h-full">
        <ScrollView contentContainerStyle={{ height: '100%' }}>
          <View className="w-full justify-center items-center min-h-[85vh] px-4">
            
            {/* Logo i Nagłówek */}
            <Image
              source={icons.logo}
              className="w-[200px] h-[80px]"
              resizeMode="contain"
            />

            <Text className="text-3xl text-white font-bold text-center mt-5">
              Odkryj filmy z <Text className="text-secondary">FlickMovie</Text>
            </Text>

            <Text className="text-sm font-regular text-gray-100 mt-7 text-center px-4">
              Dołącz do społeczności, oceniaj filmy i twórz własne listy. Lub po prostu rozejrzyj się jako gość!
            </Text>

            {/* Przyciski */}
            <View className="w-full mt-10 space-y-4">
              
              {/* Przycisk 1: Create Account */}
              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-up')}
                className="bg-secondary rounded-xl min-h-[62px] justify-center items-center w-full"
                activeOpacity={0.7}
              >
                <Text className="text-primary font-bold text-lg">
                  Stwórz konto
                </Text>
              </TouchableOpacity>

              {/* Przycisk 2: Sign In */}
              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-in')}
                className="bg-yellow-500 border-2 border-black-200 rounded-xl min-h-[62px] justify-center items-center w-full mt-4"
                activeOpacity={0.7}
              >
                <Text className="text-black font-bold text-lg">
                  Zaloguj się
                </Text>
              </TouchableOpacity>

              {/* Przycisk 3: Not Now (Guest Mode) */}
              <TouchableOpacity
                onPress={() => router.replace('/(tabs)')}
                className="mt-6"
                activeOpacity={0.7}
              >
                <Text className="text-gray-100 text-base font-regular text-center underline">
                  Nie teraz, chcę się rozejrzeć
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

export default Welcome;