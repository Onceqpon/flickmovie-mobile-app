import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { signOut } from '@/services/appwriteapi';

// Komponent pomocniczy do wyświetlania statystyk (np. 12 Ocen)
const StatItem = ({ value, label }: { value: string | number; label: string }) => (
  <View className="items-center">
    <Text className="text-xl font-bold text-white">{value}</Text>
    <Text className="text-sm text-gray-400">{label}</Text>
  </View>
);

// Komponent pomocniczy do pozycji w menu (np. Watchlist, Settings)
const MenuItem = ({ icon, title, onPress, isDestructive = false }: { icon: any, title: string, onPress: () => void, isDestructive?: boolean }) => (
  <TouchableOpacity 
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-row items-center py-4 border-b border-gray-800"
  >
    <Image 
      source={icon} 
      className="w-6 h-6 mr-4" 
      resizeMode="contain" 
      style={{ tintColor: isDestructive ? '#ef4444' : '#cdcde0' }} 
    />
    <Text className={`flex-1 text-lg ${isDestructive ? 'text-red-500 font-bold' : 'text-white'}`}>
      {title}
    </Text>
    {/* Strzałka w prawo (opcjonalnie) */}
    {!isDestructive && (
      <Image source={icons.angle_left} className="w-4 h-4 rotate-180" style={{ tintColor: '#6b7280' }} />
    )}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, setIsLogged, setUser } = useGlobalContext();

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLogged(false);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      Alert.alert("Błąd", "Wystąpił problem podczas wylogowywania");
    }
  }

  // Jeśli użytkownik nie jest zalogowany (zabezpieczenie)
  if (!user) {
    return (
      <SafeAreaView className="bg-primary h-full justify-center items-center px-4">
        <Text className="text-white text-2xl font-bold mb-4">Profil</Text>
        <Text className="text-gray-400 text-center mb-8">Zaloguj się, aby zarządzać swoim profilem, ocenami i listami.</Text>
        
        <TouchableOpacity 
          onPress={() => router.push('/(auth)')}
          className="bg-secondary w-full py-4 rounded-xl items-center"
        >
          <Text className="text-primary font-bold text-lg">Zaloguj się</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6" showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER --- */}
        <View className="flex-row items-center justify-between mb-8 mt-4">
          <View className="flex-row items-center">
            {/* Avatar - używamy avatara z Appwrite lub domyślnej ikony */}
            <View className="w-20 h-20 rounded-full border-2 border-secondary justify-center items-center bg-black-100 overflow-hidden">
               {/* Jeśli masz user.avatar (url), użyj uri. Tutaj fallback na ikonę usera */}
               <Image 
                source={icons.user} 
                className="w-12 h-12" 
                resizeMode="contain" 
                style={{ tintColor: '#fff' }}
              />
            </View>
            
            <View className="ml-4">
              <Text className="text-2xl font-bold text-white max-w-[200px]" numberOfLines={1}>
                {user.username || user.name || "Użytkownik"}
              </Text>
              <Text className="text-sm text-gray-400">{user.email}</Text>
              <TouchableOpacity className="mt-2">
                <Text className="text-secondary text-sm font-semibold">Edytuj profil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- STATS BAR --- */}
        <View className="flex-row justify-around bg-black-100 py-4 rounded-2xl mb-8 border border-gray-800">
          <StatItem value="0" label="Oceny" />
          <StatItem value="0" label="Listy" />
          <StatItem value="0" label="Recenzje" />
        </View>

        {/* --- MENU SECTIONS --- */}
        <View className="mb-6">
          <Text className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-widest">Twoja biblioteka</Text>
          
          <MenuItem 
            icon={icons.save} 
            title="Watchlist" 
            onPress={() => Alert.alert("Coming soon", "Tutaj będzie Twoja lista 'Do obejrzenia'")} 
          />
          <MenuItem 
            icon={icons.star} 
            title="Twoje Oceny" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={icons.clapperboard} 
            title="Twoje Listy" 
            onPress={() => {}} 
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-widest">Aplikacja</Text>
          
          <MenuItem 
            icon={icons.search} // Możesz tu dać ikonę settings, jeśli masz
            title="Ustawienia" 
            onPress={() => {}} 
          />
           <MenuItem 
            icon={icons.screen} // Np. ikona "wyświetlanie"
            title="Wygląd" 
            onPress={() => {}} 
          />
        </View>

        {/* --- LOGOUT --- */}
        <View className="mt-4 mb-10">
          <MenuItem 
            icon={icons.user} // Możesz dodać ikonę "logout.png" do assets
            title="Wyloguj się" 
            onPress={logout}
            isDestructive={true}
          />
          <Text className="text-center text-gray-600 text-xs mt-6">
            FlickMovie v1.0.0
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;