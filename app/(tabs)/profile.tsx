import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { cssInterop } from "nativewind";
import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import {
  getListsCount,
  getReviewsCount,
  getWatchlistCount,
  getWatchlistSeriesCount,
  signOut
} from '@/services/appwriteapi';

cssInterop(LinearGradient, {
  className: "style",
});

const StatItem = ({ value, label }: { value: string | number; label: string }) => (
  <View className="items-center flex-1">
    <Text className="text-2xl font-black text-white">{value}</Text>
    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</Text>
  </View>
);

const MenuItem = ({ icon, title, onPress, isDestructive = false }: { icon: any, title: string, onPress: () => void, isDestructive?: boolean }) => (
  <TouchableOpacity 
    onPress={onPress}
    activeOpacity={0.7}
    className={`flex-row items-center py-4 px-4 mb-2 rounded-2xl border ${isDestructive ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/5'}`}
  >
    <View className={`p-2 rounded-full mr-4 ${isDestructive ? 'bg-red-500/20' : 'bg-white/10'}`}>
        <Image 
          source={icon} 
          className="w-5 h-5" 
          resizeMode="contain" 
          style={{ tintColor: isDestructive ? '#ef4444' : '#FFA001' }} 
        />
    </View>
    
    <Text className={`flex-1 text-lg font-semibold ${isDestructive ? 'text-red-500' : 'text-white'}`}>
      {title}
    </Text>
    
    {!isDestructive && (
      <View className="bg-white/10 p-1.5 rounded-full">
         <Image source={icons.left_arrow} className="w-3 h-3 rotate-180" style={{ tintColor: '#9CA3AF' }} />
      </View>
    )}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, setIsLogged, setUser } = useGlobalContext();
  
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [listsCount, setListsCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);

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
            const [moviesCount, seriesCount, fetchedListsCount, fetchedReviewsCount] = await Promise.all([
              getWatchlistCount(user.$id),
              getWatchlistSeriesCount(user.$id),
              getListsCount(user.$id),
              getReviewsCount(user.$id)
            ]);
            
            setWatchlistCount(moviesCount + seriesCount);
            setListsCount(fetchedListsCount);
            setReviewsCount(fetchedReviewsCount);
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
      <View className="flex-1 bg-[#1E1E2D]">
          <LinearGradient
            colors={["#000C1C", "#161622", "#1E1E2D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="absolute w-full h-full"
          />
          <SafeAreaView className="flex-1 justify-center items-center px-6">
            <Image source={icons.user} className="w-20 h-20 mb-6" tintColor="#FFA001" />
            <Text className="text-white text-3xl font-black mb-2 tracking-tight">Profile</Text>
            <Text className="text-gray-400 text-center mb-10 text-base leading-6">
                Log in to manage your watchlist, rate movies, and create custom lists.
            </Text>
            
            <TouchableOpacity 
              onPress={() => router.push('/(auth)')}
              className="bg-secondary w-full py-4 rounded-xl items-center shadow-lg shadow-secondary/50"
            >
              <Text className="text-primary font-bold text-lg">Sign In / Sign Up</Text>
            </TouchableOpacity>
          </SafeAreaView>
      </View>
    );
  }

  const rawAvatar = (user?.prefs as any)?.avatar;
  const userAvatar = typeof rawAvatar === 'string' ? rawAvatar : null;

  return (
    <View className="flex-1 bg-[#1E1E2D]">
      <LinearGradient
        colors={["#000C1C", "#161622", "#1E1E2D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute w-full h-full"
      />

      <SafeAreaView className="flex-1">
        <ScrollView className="px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            
          <View className="items-center mt-6 mb-8">
            <View className="relative">
                <View className="w-28 h-28 rounded-full border-4 border-secondary/20 justify-center items-center bg-white/5 overflow-hidden shadow-xl">
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
                <TouchableOpacity 
                    onPress={() => router.push('/profile/edit')}
                    className="absolute bottom-0 right-0 bg-secondary p-2 rounded-full border-4 border-[#161622]"
                >
                    <Image source={icons.edit || icons.plus} className="w-4 h-4" tintColor="#000C1C" />
                </TouchableOpacity>
            </View>

            <Text className="text-3xl font-black text-white mt-4 tracking-tight text-center">
                {user.name || "User"}
            </Text>
            <Text className="text-gray-400 text-sm font-medium">{user.email}</Text>
          </View>

          <View className="flex-row justify-around bg-white/5 py-5 rounded-3xl mb-10 border border-white/10 backdrop-blur-md">
            <StatItem value={watchlistCount} label="Watchlist" />
            <View className="w-[1px] h-full bg-white/10" />
            <StatItem value={listsCount} label="Lists" />
            <View className="w-[1px] h-full bg-white/10" />
            <StatItem value={reviewsCount} label="Reviews" />
          </View>

          <View className="mb-8">
            <Text className="text-secondary font-black mb-4 uppercase text-sm tracking-widest ml-2 opacity-80">
                My Library
            </Text>
            
            <MenuItem 
                icon={icons.bookmark} 
                title="Watchlist" 
                onPress={() => router.push('/profile/watchlist')} 
            />
            <MenuItem 
                icon={icons.star} 
                title="Ratings & Reviews" 
                onPress={() => router.push('/profile/ratings')} 
            />
            <MenuItem 
                icon={icons.playlist} 
                title="Custom Lists" 
                onPress={() => router.push('/profile/lists')} 
            />
            <MenuItem 
                icon={icons.play} 
                title="Game History" 
                onPress={() => router.push('/profile/game-history' as any)} 
            />
          </View>

          <View className="mb-8">
            <Text className="text-secondary font-black mb-4 uppercase text-sm tracking-widest ml-2 opacity-80">
                Settings
            </Text>
            
            <MenuItem 
                icon={icons.search} 
                title="App Settings" 
                onPress={() => {}} 
            />
             <MenuItem 
                icon={icons.home} 
                title="Appearance" 
                onPress={() => {}} 
            />
          </View>

          <View className="mt-2 mb-10">
            <MenuItem 
                icon={icons.user} 
                title="Log Out" 
                onPress={logout}
                isDestructive={true}
            />
            <Text className="text-center text-gray-600 text-xs mt-6 font-medium">
                FlickMovie v1.0.0 • Built with Expo
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Profile;