import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown
} from 'react-native-reanimated';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { addItemToList, getUserLists, removeItemFromList } from '@/services/appwriteapi';

interface SaveToListModalProps {
  visible: boolean;
  onClose: () => void;
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

const SaveToListModal = ({ visible, onClose, mediaId, mediaType }: SaveToListModalProps) => {
  const { user } = useGlobalContext();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingListId, setProcessingListId] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    try {
      const userLists = await getUserLists(user.$id);
      setLists(userLists);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    if (visible && user) {
      fetchLists();
    }
  }, [visible, user, fetchLists]);

  const handleToggleList = async (listId: string, currentItems: string[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProcessingListId(listId);
    
    const itemString = `${mediaType}:${mediaId}`;
    const isOnList = currentItems.includes(itemString);

    try {
      if (isOnList) {
        await removeItemFromList(listId, mediaId.toString(), mediaType);
      } else {
        await addItemToList(listId, mediaId.toString(), mediaType);
      }
      await fetchLists();
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the list.');
    } finally {
      setProcessingListId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const itemString = `${mediaType}:${mediaId}`;
    const isOnList = item.items.includes(itemString);

    return (
      <TouchableOpacity
        onPress={() => handleToggleList(item.$id, item.items)}
        disabled={processingListId === item.$id}
        activeOpacity={0.6}
        className={`p-5 rounded-2xl mb-3 flex-row justify-between items-center border ${
          isOnList 
            ? 'bg-secondary/10 border-secondary'
            : 'bg-black-200/40 border-white/5' 
        }`}
      >
        <View className="flex-1">
          <Text className={`font-psemibold text-base ${isOnList ? 'text-secondary' : 'text-white'}`} numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-gray-100 text-xs mt-1">
            {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {processingListId === item.$id ? (
          <ActivityIndicator size="small" color="#FF9C01" />
        ) : (
          <View className={`w-5 h-5 rounded-full border ${isOnList ? 'bg-secondary border-secondary' : 'border-white/20'}`}>
            {isOnList && <Image source={icons.save} className="w-full h-full" tintColor="#161622" />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* Backdrop overlay */}
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/60"
        >
          <TouchableOpacity className="flex-1" onPress={onClose} activeOpacity={1} />
        </Animated.View>
        
        {/* Bottom Sheet Content */}
        <Animated.View 
          entering={SlideInDown.duration(400)} 
          exiting={SlideOutDown.duration(300)}
          className="bg-[#161622] h-[55%] rounded-t-[32px] border-t border-white/10 overflow-hidden"
        >
          {/* Visual Handle Bar */}
          <View className="w-full items-center py-4">
            <View className="w-10 h-1 bg-white/10 rounded-full" />
          </View>

          <View className="px-6 flex-1">
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-white text-xl font-pbold">Save to List</Text>
                <Text className="text-gray-100 text-xs font-pregular mt-1">Your Collections</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-1">
                <Image source={icons.close} className="w-5 h-5" tintColor="#666" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#FF9C01" />
              </View>
            ) : (
              <FlatList
                data={lists}
                keyExtractor={(item) => item.$id}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View className="items-center justify-center mt-10">
                    <Text className="text-gray-100 font-pmedium">No lists found</Text>
                    <Text className="text-gray-100/50 text-xs mt-1">Create a list in your profile first</Text>
                  </View>
                )}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SaveToListModal;