import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import {
  addToWatchlist,
  addToWatchlistSeries,
  checkIsOnWatchlist,
  checkIsOnWatchlistSeries,
  removeFromWatchlist,
  removeFromWatchlistSeries
} from '@/services/appwriteapi';

interface WatchlistButtonProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    vote_average: number;
  };
  type: 'movie' | 'series';
}

const WatchlistButton = ({ item, type }: WatchlistButtonProps) => {
  const { user } = useGlobalContext();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const result = type === 'movie' 
          ? await checkIsOnWatchlist(user.$id, item.id)
          : await checkIsOnWatchlistSeries(user.$id, item.id);
        setIsSaved(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user, item.id, type]);

  const toggleWatchlist = async () => {
    if (!user) {
      Alert.alert("Informacja", "Zaloguj się, aby zarządzać listą.");
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    scale.value = withSequence(withSpring(1.3), withSpring(1));

    const previousState = isSaved;
    setIsSaved(!isSaved); 

    try {
      if (type === 'movie') {
        const movieData = {
          id: item.id,
          title: item.title || "",
          poster_path: item.poster_path,
          vote_average: item.vote_average
        };
        previousState 
          ? await removeFromWatchlist(user.$id, item.id) 
          : await addToWatchlist(user.$id, movieData);
      } else {
        const seriesData = {
          id: item.id,
          name: item.name || item.title || "",
          poster_path: item.poster_path,
          vote_average: item.vote_average
        };
        previousState 
          ? await removeFromWatchlistSeries(user.$id, item.id) 
          : await addToWatchlistSeries(user.$id, seriesData);
      }
    } catch (error) {
      setIsSaved(previousState);
      Alert.alert("Błąd", "Nie udało się zaktualizować listy.");
    }
  };

  if (loading) {
    return (
      <View className="p-3">
        <ActivityIndicator size="small" color="#FF9C01" />
      </View>
    );
  }

  return (
    <TouchableOpacity 
      onPress={toggleWatchlist} 
      activeOpacity={0.7}
      className={`p-3 rounded-full border ${
        isSaved ? 'bg-orange-500/20 border-orange-500/50' : 'bg-white/10 border-white/20'
      } backdrop-blur-md`}
    >
      <Animated.View style={animatedStyle}>
        <Image
          source={isSaved ? icons.save : icons.save}
          className="w-6 h-6"
          resizeMode="contain"
          tintColor={isSaved ? '#FF9C01' : '#FFFFFF'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default WatchlistButton;