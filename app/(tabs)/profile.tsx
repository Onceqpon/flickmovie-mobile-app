import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getWatchlistCount, getWatchlistSeriesCount, signOut } from '@/services/appwriteapi';

const StatItem = ({ value, label }: { value: string | number; label: string }) => (
  <View className="items-center">
    <Text className="text-xl font-bold text-white">{value}</Text>
    <Text className="text-sm text-gray-400">{label}</Text>
  </View>
);

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
    {!isDestructive && (
      <Image source={icons.left_arrow} className="w-4 h-4 rotate-180" style={{ tintColor: '#6b7280' }} />
    )}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, setIsLogged, setUser } = useGlobalContext();
  const [watchlistCount, setWatchlistCount] = useState(0);

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLogged(false);
      router.replace('/(auth)/sign-in');
    } catch {
      Alert.alert("Error", "A problem occurred while logging out");
    }
  }

  useFocusEffect(
    useCallback(() => {
      const fetchCount = async () => {
        if (user) {
          try {
            const [moviesCount, seriesCount] = await Promise.all([
              getWatchlistCount(user.$id),
              getWatchlistSeriesCount(user.$id)
            ]);
            setWatchlistCount(moviesCount + seriesCount);
          } catch (error) {
            console.error("Failed to load stats", error);
          }
        }
      };
      fetchCount();
    }, [user])
  );

  if (!user) {
    return (
      <SafeAreaView className="bg-primary h-full justify-center items-center px-4">
        <Text className="text-white text-2xl font-bold mb-4">Profile</Text>
        <Text className="text-gray-400 text-center mb-8">Log in to manage your profile, ratings, and lists.</Text>
        
        <TouchableOpacity 
          onPress={() => router.push('/(auth)')}
          className="bg-secondary w-full py-4 rounded-xl items-center"
        >
          <Text className="text-primary font-bold text-lg">Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const rawAvatar = (user?.prefs as any)?.avatar;
  const userAvatar = typeof rawAvatar === 'string' ? rawAvatar : null;

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row items-center justify-between mb-8 mt-4">
          <View className="flex-row items-center">
            <View className="w-20 h-20 rounded-full border-2 border-secondary justify-center items-center bg-black-100 overflow-hidden">
               {userAvatar ? (
                <Image 
                  source={{ uri: userAvatar }} 
                  className="w-full h-full" 
                  resizeMode="cover" 
                />
              ) : (
                <Image 
                  source={icons.user} 
                  className="w-12 h-12" 
                  resizeMode="contain" 
                  style={{ tintColor: '#fff' }}
                />
              )}
            </View>
            
            <View className="ml-4">
              <Text className="text-2xl font-bold text-white max-w-[200px]" numberOfLines={1}>
                {user.name || "User"}
              </Text>
              <Text className="text-sm text-gray-400">{user.email}</Text>
              <TouchableOpacity 
                className="mt-2"
                onPress={() => router.push('/profile/edit')}
              >
                <Text className="text-secondary text-sm font-semibold">Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-row justify-around bg-black-100 py-4 rounded-2xl mb-8 border border-gray-800">
          <StatItem value={watchlistCount} label="Watchlist" />
          <StatItem value="0" label="Lists" />
          <StatItem value="0" label="Reviews" />
        </View>

        <View className="mb-6">
          <Text className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-widest">Library</Text>
          
          <MenuItem 
            icon={icons.save} 
            title="Watchlist" 
            onPress={() => router.push('/profile/watchlist')} 
          />
          <MenuItem 
            icon={icons.star} 
            title="Your Ratings" 
            onPress={() => router.push('/profile/ratings')} 
          />
          <MenuItem 
            icon={icons.clapperboard} 
            title="Your Lists" 
            onPress={() => {}} 
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-widest">Application</Text>
          
          <MenuItem 
            icon={icons.search} 
            title="Settings" 
            onPress={() => {}} 
          />
           <MenuItem 
            icon={icons.screen} 
            title="Appearance" 
            onPress={() => {}} 
          />
        </View>

        <View className="mt-4 mb-10">
          <MenuItem 
            icon={icons.user} 
            title="Log Out" 
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