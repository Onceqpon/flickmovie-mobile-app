import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { cssInterop } from "nativewind";
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { createList, deleteList, getUserLists, updateList } from '@/services/appwriteapi';

cssInterop(LinearGradient, {
  className: "style",
});

const Lists = () => {
  const { user } = useGlobalContext();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingList, setEditingList] = useState<any | null>(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    if (!user?.$id) return;
    setLoading(true);
    try {
      const result = await getUserLists(user.$id);
      setLists(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.$id) {
    Alert.alert("Error", "You must be logged in to perform this action.");
    return;
  }
  
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Required', 'Please enter a list name');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingList) {
        await updateList(editingList.$id, name, description);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await createList(user.$id, name, description);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      resetForm();
      fetchLists();
    } catch (error) {
      Alert.alert('Error', 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (listId: string, listName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Delete List",
      `Are you sure you want to delete "${listName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteList(listId);
              fetchLists();
            } catch (error) {
              Alert.alert("Error", "Could not delete list.");
            }
          }
        }
      ]
    );
  };

  const startEditing = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingList(item);
    setName(item.name);
    setDescription(item.description || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingList(null);
    setShowForm(false);
  };

  const renderHeader = () => (
    <View className="px-6 mt-4">
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="bg-white/5 p-2 rounded-full mr-4 border border-white/10"
          >
             <Image source={icons.left_arrow} className="w-5 h-5" tintColor="white" resizeMode="contain" />
          </TouchableOpacity>
          <Text className="text-3xl text-white font-pbold">My Lists</Text>
        </View>
        
        {!showForm && (
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowForm(true);
            }}
            className="bg-secondary p-3 rounded-full"
          >
            <Image source={icons.plus} className="w-5 h-5" tintColor="#161622" />
          </TouchableOpacity>
        )}
      </View>

      {showForm && (
        <Animated.View 
          entering={FadeInUp} 
          layout={Layout.springify()}
          className="bg-white/5 p-6 rounded-[32px] mb-8 border border-white/10"
        >
          <Text className="text-white font-psemibold text-xl mb-5">
            {editingList ? 'Edit List' : 'New Collection'}
          </Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-gray-100 text-xs mb-2 ml-1 font-pmedium uppercase tracking-widest">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="List name..."
                placeholderTextColor="#555"
                className="bg-black-200 text-white px-5 py-4 rounded-2xl font-psemibold border border-white/5 focus:border-secondary"
              />
            </View>

            <View>
              <Text className="text-gray-100 text-xs mb-2 ml-1 font-pmedium uppercase tracking-widest">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What's this list about?"
                placeholderTextColor="#555"
                multiline
                className="bg-black-200 text-white px-5 py-4 rounded-2xl font-psemibold border border-white/5 focus:border-secondary h-24"
                textAlignVertical="top"
              />
            </View>
          </View>

          <View className="flex-row gap-3 mt-6">
             <TouchableOpacity 
              onPress={resetForm}
              className="flex-1 bg-white/5 py-4 rounded-2xl justify-center items-center"
            >
              <Text className="text-white font-psemibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 bg-secondary py-4 rounded-2xl justify-center items-center ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isSubmitting ? <ActivityIndicator color="#161622" /> : <Text className="text-primary font-pbold">Save</Text>}
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-[#0d0d12]">
      <LinearGradient colors={["#161622", "#0d0d12"]} className="absolute inset-0" />

      <SafeAreaView className="flex-1">
        <FlatList
          data={lists}
          keyExtractor={(item) => item.$id}
          ListHeaderComponent={renderHeader()} 
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View 
              entering={FadeInDown.delay(index * 100)}
              className="mx-6 mb-4 overflow-hidden rounded-[28px]"
            >
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => router.push(`/profile/lists/${item.$id}` as any)}
                className="bg-white/5 p-5 border border-white/10"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-white font-pbold text-xl mb-1">{item.name}</Text>
                    {item.description && (
                      <Text className="text-gray-400 text-sm font-pregular" numberOfLines={2}>{item.description}</Text>
                    )}
                  </View>
                  <View className="bg-secondary/20 px-3 py-1.5 rounded-full border border-secondary/30">
                    <Text className="text-secondary text-[10px] font-pbold uppercase">
                      {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-end space-x-2 pt-4 border-t border-white/5">
                  <TouchableOpacity 
                    onPress={() => startEditing(item)}
                    className="flex-row items-center bg-white/5 px-4 py-2 rounded-xl border border-white/10"
                  >
                    <Image source={icons.eye} className="w-3.5 h-3.5 mr-2" tintColor="#FF9C01" /> 
                    <Text className="text-white text-xs font-psemibold">Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => handleDelete(item.$id, item.name)}
                    className="flex-row items-center bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20"
                  >
                    <Image source={icons.close} className="w-3.5 h-3.5 mr-2" tintColor="#FF4444" />
                    <Text className="text-red-400 text-xs font-psemibold">Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          ListEmptyComponent={() => (
            !loading && (
              <View className="items-center justify-center py-20 px-10">
                 <View className="w-24 h-24 bg-white/5 rounded-full items-center justify-center mb-6">
                   <Image source={icons.bookmark} className="w-10 h-10 opacity-20" tintColor="white" />
                 </View>
                 <Text className="text-white text-xl font-pbold text-center">Your vault is empty</Text>
                 <Text className="text-gray-500 text-center font-pregular mt-2">
                   Start by creating a collection to organize your cinematic journey.
                 </Text>
              </View>
            )
          )}
          refreshing={loading}
          onRefresh={fetchLists}
        />
      </SafeAreaView>
    </View>
  );
};

export default Lists;