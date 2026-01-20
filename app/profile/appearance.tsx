import AsyncStorage from '@react-native-async-storage/async-storage'; // IMPORT
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';

export default function Appearance() {
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Ładowanie motywu
  useEffect(() => {
      const loadTheme = async () => {
          const savedTheme = await AsyncStorage.getItem('app_theme');
          if (savedTheme) setTheme(savedTheme as 'dark' | 'light');
      };
      loadTheme();
  }, []);

  // Zmiana i zapis motywu
  const handleThemeChange = async (newTheme: 'dark' | 'light') => {
      setTheme(newTheme);
      await AsyncStorage.setItem('app_theme', newTheme);
  };

  return (
    <View className="flex-1 bg-[#1E1E2D]">
      <LinearGradient colors={["#000C1C", "#161622", "#1E1E2D"]} className="absolute w-full h-full" />
      <SafeAreaView className="flex-1 px-4">
        
        <View className="flex-row items-center mt-4 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white/10 rounded-full mr-4">
             <Image source={icons.left_arrow} className="w-5 h-5" tintColor="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-white">Appearance</Text>
        </View>

        <View className="bg-white/5 rounded-2xl p-4">
            <Text className="text-gray-400 mb-4">Choose your preferred theme style.</Text>
            
            <TouchableOpacity 
                onPress={() => handleThemeChange('dark')}
                className={`flex-row items-center justify-between p-4 rounded-xl border mb-3 ${theme === 'dark' ? 'bg-secondary/10 border-secondary' : 'bg-black/20 border-white/5'}`}
            >
                <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-[#1E1E2D] border border-gray-600 mr-3" />
                    <Text className="text-white font-bold text-lg">Dark Mode</Text>
                </View>
                {theme === 'dark' && <Image source={icons.search} className="w-5 h-5" tintColor="#FFA001" />} 
                {/* Upewnij się że masz ikonę 'check' w icons, lub użyj View jako kropki */}
                {theme === 'dark' && !icons.search && <View className="w-4 h-4 bg-secondary rounded-full" />}
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => handleThemeChange('light')}
                className={`flex-row items-center justify-between p-4 rounded-xl border ${theme === 'light' ? 'bg-secondary/10 border-secondary' : 'bg-black/20 border-white/5'}`}
            >
                <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-white border border-gray-300 mr-3" />
                    <Text className="text-white font-bold text-lg">Light Mode</Text>
                </View>
                {theme === 'light' && <Image source={icons.search} className="w-5 h-5" tintColor="#FFA001" />}
                {theme === 'light' && !icons.search && <View className="w-4 h-4 bg-secondary rounded-full" />}
            </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}