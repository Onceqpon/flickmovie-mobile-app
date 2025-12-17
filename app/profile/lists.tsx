import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../constants/icons';
import { useGlobalContext } from '../../context/GlobalProvider';
import { createList, deleteList, getUserLists, updateList } from '../../services/appwriteapi';

const Lists = () => {
  const { user } = useGlobalContext();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingList, setEditingList] = useState<any | null>(null); // Przechowuje edytowaną listę

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
      console.error(error);
      Alert.alert('Error', 'Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  // Obsługa zarówno Tworzenia jak i Edycji
  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a list name');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingList) {
        // --- UPDATE MODE ---
        await updateList(editingList.$id, name, description);
        Alert.alert('Success', 'List updated successfully');
      } else {
        // --- CREATE MODE ---
        await createList(user.$id, name, description);
        Alert.alert('Success', 'New list created');
      }

      // Reset form and refresh
      resetForm();
      fetchLists();
    } catch (error) {
      Alert.alert('Error', 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (listId: string, listName: string) => {
    Alert.alert(
      "Delete List",
      `Are you sure you want to delete "${listName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteList(listId);
              fetchLists(); // Refresh immediately
              Alert.alert("Deleted", "List has been removed.");
            } catch (error) {
              Alert.alert("Error", "Could not delete list.");
            }
          }
        }
      ]
    );
  };

  const startEditing = (item: any) => {
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

  // Funkcja renderująca nagłówek (Formularz + Tytuł)
  const renderHeader = () => (
    <View className="px-4 my-6">
      {/* Header with Back Button */}
      <View className="flex-row items-center mb-8">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="bg-black-100 p-2 rounded-full mr-4"
        >
           <Image 
             source={icons.angle_left} 
             className="w-5 h-5" 
             tintColor="white" 
             resizeMode="contain" 
           />
        </TouchableOpacity>
        <Text className="text-2xl text-white font-psemibold">My Lists</Text>
      </View>

      {/* Create / Edit Form Toggle */}
      {!showForm ? (
        <TouchableOpacity 
          onPress={() => {
            resetForm(); // Ensure we are in "Create" mode, not "Edit"
            setShowForm(true);
          }}
          className="bg-secondary p-4 rounded-xl flex-row justify-center items-center mb-6 shadow-md shadow-black"
        >
          <View className="w-6 h-6 rounded-full border-2 border-primary justify-center items-center mr-2">
            <Text className="text-primary font-pbold leading-4" style={{marginTop: -2}}>+</Text>
          </View>
          <Text className="text-primary font-pbold text-lg">Create New List</Text>
        </TouchableOpacity>
      ) : (
        <View className="bg-black-100 p-5 rounded-2xl mb-8 border border-black-200">
          <Text className="text-white font-psemibold text-lg mb-4">
            {editingList ? 'Edit List' : 'New List'}
          </Text>
          
          <View className="mb-4">
            <Text className="text-gray-100 text-base mb-2 font-pmedium">Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Weekend Horror"
              placeholderTextColor="#7b7b8b"
              className="bg-primary text-white p-4 rounded-xl font-psemibold focus:border-secondary border-2 border-transparent"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-100 text-base mb-2 font-pmedium">Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Short description..."
              placeholderTextColor="#7b7b8b"
              multiline
              className="bg-primary text-white p-4 rounded-xl font-psemibold focus:border-secondary border-2 border-transparent h-24"
              textAlignVertical="top"
            />
          </View>

          <View className="flex-row gap-4">
             <TouchableOpacity 
              onPress={resetForm}
              className="flex-1 bg-gray-800 p-4 rounded-xl justify-center items-center"
            >
              <Text className="text-white font-psemibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 bg-secondary p-4 rounded-xl justify-center items-center ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#161622" />
              ) : (
                 <Text className="text-primary font-pbold">
                    {editingList ? 'Save Changes' : 'Create'}
                 </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="bg-primary flex-1">
      <FlatList
        data={lists}
        keyExtractor={(item) => item.$id}
        // Wywołujemy renderHeader() aby uniknąć problemów z klawiaturą
        ListHeaderComponent={renderHeader()} 
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View className="bg-black-100 mx-4 mb-4 p-5 rounded-2xl border border-black-200">
            {/* Main Content (Clickable to view details later) */}
            <TouchableOpacity 
              className="mb-4"
              activeOpacity={0.7}
              onPress={() => router.push(`/profile/lists/${item.$id}` as any)}
            >
                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-2">
                        <Text className="text-white font-psemibold text-xl mb-1">{item.name}</Text>
                        {item.description ? (
                            <Text className="text-gray-100 text-sm mb-3 font-pregular" numberOfLines={2}>
                            {item.description}
                            </Text>
                        ) : null}
                        <View className="bg-primary/50 self-start px-3 py-1 rounded-lg">
                            <Text className="text-secondary text-xs font-pmedium">
                                {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Action Buttons Row (Edit / Delete) */}
            <View className="flex-row justify-end gap-3 border-t border-black-200 pt-3">
                <TouchableOpacity 
                    onPress={() => startEditing(item)}
                    className="flex-row items-center bg-gray-800 px-3 py-2 rounded-lg"
                >
                    {/* Jeśli nie masz icons.edit, użyj icons.eye lub innego */}
                    <Image source={icons.edit || icons.eye} className="w-4 h-4 mr-2" tintColor="#FFA500" resizeMode="contain"/> 
                    <Text className="text-white text-xs font-psemibold">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleDelete(item.$id, item.name)}
                    className="flex-row items-center bg-red-900/30 px-3 py-2 rounded-lg"
                >
                    {/* Jeśli nie masz icons.trash, użyj icons.close */}
                    <Image source={icons.trash || icons.close} className="w-4 h-4 mr-2" tintColor="#FF4444" resizeMode="contain"/>
                    <Text className="text-red-400 text-xs font-psemibold">Delete</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          !loading && (
            <View className="justify-center items-center px-4 py-10">
               <Image 
                 source={icons.bookmark || icons.save} 
                 className="w-16 h-16 mb-4 opacity-20" 
                 tintColor="white" 
                 resizeMode="contain"
               />
               <Text className="text-white text-xl font-psemibold text-center mb-2">No lists yet</Text>
               <Text className="text-gray-100 text-center font-pmedium max-w-[250px]">
                 Create your first list to group your favorite movies and TV shows.
               </Text>
            </View>
          )
        )}
        refreshing={loading}
        onRefresh={fetchLists}
      />
    </SafeAreaView>
  );
};

export default Lists;