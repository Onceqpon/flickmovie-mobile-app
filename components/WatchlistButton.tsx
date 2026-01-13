import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';

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

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    const checkStatus = async () => {
      try {
        if (type === 'movie') {
          const result = await checkIsOnWatchlist(user.$id, item.id);
          setIsSaved(result);
        } else {
          const result = await checkIsOnWatchlistSeries(user.$id, item.id);
          setIsSaved(result);
        }
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
        Alert.alert("Info", "Please log in to use watchlist");
        return;
    };
    
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
        
        if (previousState) {
          await removeFromWatchlist(user.$id, item.id);
        } else {
          await addToWatchlist(user.$id, movieData);
        }
      } else {
        const seriesData = {
          id: item.id,
          name: item.name || item.title || "", 
          poster_path: item.poster_path,
          vote_average: item.vote_average
        };

        if (previousState) {
          await removeFromWatchlistSeries(user.$id, item.id);
        } else {
          await addToWatchlistSeries(user.$id, seriesData);
        }
      }
    } catch (error) {
      setIsSaved(previousState);
      Alert.alert("Error", "Could not update watchlist");
    }
  };

  if (loading) return <ActivityIndicator size="small" color="#fff" />;

  return (
    <TouchableOpacity onPress={toggleWatchlist} className="bg-white/10 p-3 rounded-full backdrop-blur-md">
      <Image
        source={icons.save}
        className="w-6 h-6"
        resizeMode="contain"
        tintColor={isSaved ? '#FF9C01' : '#FFFFFF'}
      />
    </TouchableOpacity>
  );
};

export default WatchlistButton;