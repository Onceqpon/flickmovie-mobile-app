import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, Text, TouchableOpacity, View } from 'react-native';

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
  const [loading, setLoading] = useState(true);
  const [processingListId, setProcessingListId] = useState<string | null>(null);

  useEffect(() => {
    if (visible && user) {
      fetchLists();
    }
  }, [visible, user]);

  const fetchLists = async () => {
    if (!user?.$id) return;
    setLoading(true);
    try {
      const userLists = await getUserLists(user.$id);
      setLists(userLists);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleList = async (listId: string, currentItems: string[]) => {
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
      console.error(error);
      Alert.alert('Error', 'Problem occurred while updating list.');
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
        activeOpacity={0.7}
        className={`p-4 rounded-2xl mb-3 flex-row justify-between items-center border-2 ${
          isOnList 
            ? 'bg-black-100 border-secondary'
            : 'bg-black-100 border-black-200' 
        }`}
      >
        <View className="flex-1 pr-4">
          <Text className={`font-psemibold text-lg ${isOnList ? 'text-secondary' : 'text-white'}`} numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-gray-100 text-xs font-pregular mt-1">
            {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {processingListId === item.$id ? (
          <ActivityIndicator color="#FF9C01" />
        ) : (
          <View className={`w-8 h-8 rounded-full justify-center items-center ${
            isOnList 
              ? 'bg-secondary border border-secondary' 
              : 'bg-transparent border-2 border-black-200'
          }`}>
              {isOnList ? (
                <Image 
                  source={icons.bookmark} 
                  className="w-4 h-4" 
                  resizeMode="contain" 
                  tintColor="#161622" 
                />
              ) : (
               <Image 
                  source={icons.plus} 
                  className="w-4 h-4" 
                  resizeMode="contain" 
                  tintColor="#CDCDE0" 
               />
             )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/80">
        <TouchableOpacity 
           className="flex-1" 
           onPress={onClose} 
           activeOpacity={1} 
        />
        
        <View className="bg-[#1E1E2D] h-[55%] rounded-t-[30px] p-6 border-t border-black-200 shadow-xl">
          
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-white text-xl font-psemibold">Save to List</Text>
              <Text className="text-gray-100 text-sm font-pregular mt-1">Select a collection</Text>
            </View>
            
            <TouchableOpacity onPress={onClose} className="p-2 bg-black-100 rounded-full border border-black-200">
               <Image 
                 source={icons.close} 
                 className="w-4 h-4" 
                 resizeMode="contain" 
                 tintColor="#CDCDE0" 
               />
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
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              ListEmptyComponent={() => (
                <View className="items-center justify-center mt-10 px-4">
                   <Image 
                      source={icons.bookmark} 
                      className="w-12 h-12 mb-4 opacity-50"
                      resizeMode="contain"
                      tintColor="#CDCDE0"
                   />
                   <Text className="text-gray-100 text-center font-pmedium text-lg">No lists</Text>
                   <Text className="text-gray-100 text-center text-sm mt-2 font-pregular">
                     Create your first list in your profile to save movies.
                   </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SaveToListModal;