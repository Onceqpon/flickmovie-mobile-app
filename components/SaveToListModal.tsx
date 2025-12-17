import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { icons } from '../constants/icons'; // Upewnij się, że masz tu ikonę 'check' lub 'tick', jeśli nie - użyjemy innej
import { useGlobalContext } from '../context/GlobalProvider';
import { addItemToList, getUserLists, removeItemFromList } from '../services/appwriteapi';

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
  
  // Przechowujemy ID listy, która jest aktualnie przetwarzana (dodawana/usuwana), aby pokazać spinner
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
      Alert.alert('Błąd', 'Nie udało się pobrać list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleList = async (listId: string, currentItems: string[]) => {
    setProcessingListId(listId);
    
    // Tworzymy identyfikator w formacie bazy danych
    const itemString = `${mediaType}:${mediaId}`;
    const isOnList = currentItems.includes(itemString);

    try {
      if (isOnList) {
        // --- USUWANIE ---
        await removeItemFromList(listId, mediaId.toString(), mediaType);
        // Alert.alert('Usunięto', 'Film został usunięty z listy.'); // Opcjonalne powiadomienie
      } else {
        // --- DODAWANIE ---
        await addItemToList(listId, mediaId.toString(), mediaType);
        // Alert.alert('Dodano', 'Film został dodany do listy.'); // Opcjonalne powiadomienie
      }
      
      // Odśwież listy, aby zaktualizować UI (pokazać/ukryć ptaszka)
      await fetchLists();
      
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Wystąpił problem podczas aktualizacji listy.');
    } finally {
      setProcessingListId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    // Sprawdzamy czy ten konkretny film jest na tej liście
    const itemString = `${mediaType}:${mediaId}`;
    const isOnList = item.items.includes(itemString);

    return (
      <TouchableOpacity
        onPress={() => handleToggleList(item.$id, item.items)}
        disabled={processingListId === item.$id}
        className={`p-4 rounded-xl mb-3 flex-row justify-between items-center border ${
          isOnList ? 'bg-black-200 border-secondary' : 'bg-black-100 border-black-200'
        }`}
      >
        <View className="flex-1 pr-4">
          <Text className={`font-psemibold text-lg ${isOnList ? 'text-secondary' : 'text-white'}`}>
            {item.name}
          </Text>
          <Text className="text-gray-100 text-xs">
            {item.items.length} pozycji
          </Text>
        </View>

        {/* Prawa strona: Spinner lub Ikona */}
        {processingListId === item.$id ? (
          <ActivityIndicator color="#FF9C01" />
        ) : (
          <View className={`w-8 h-8 rounded-full justify-center items-center ${
            isOnList ? 'bg-secondary' : 'bg-black-100 border border-gray-500'
          }`}>
             {isOnList ? (
                // Ikona "Sprawdzone" / "Obecne"
                // Jeśli nie masz icons.check, użyj icons.bookmark lub po prostu tekst "V"
                <Image 
                  source={icons.save} 
                  className="w-4 h-4" 
                  resizeMode="contain" 
                  tintColor="#161622" // Ciemny kolor na pomarańczowym tle
                />
             ) : (
                // Ikona "Plus" / "Dodaj"
               <Image 
                  source={icons.playlist} // Upewnij się, że masz tę ikonę, lub użyj Text "+"
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
      animationType="slide"
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
        
        <View className="bg-primary h-[55%] rounded-t-3xl p-5 border-t border-black-200">
          
          {/* Nagłówek */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-white text-xl font-psemibold">Zarządzaj listami</Text>
              <Text className="text-gray-100 text-xs font-pregular">Kliknij, aby dodać lub usunąć</Text>
            </View>
            
            <TouchableOpacity onPress={onClose} className="p-2 bg-black-100 rounded-full">
               <Image 
                 source={icons.close} 
                 className="w-5 h-5" 
                 resizeMode="contain" 
                 tintColor="white" 
               />
            </TouchableOpacity>
          </View>

          {/* Lista kolekcji */}
          {loading ? (
            <ActivityIndicator size="large" color="#FF9C01" className="mt-10" />
          ) : (
            <FlatList
              data={lists}
              keyExtractor={(item) => item.$id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={renderItem}
              ListEmptyComponent={() => (
                <View className="items-center mt-10">
                   <Text className="text-gray-100 text-center font-pmedium">Nie masz jeszcze żadnych list.</Text>
                   <Text className="text-gray-100 text-center text-xs mt-2 max-w-[200px]">
                     Przejdź do profilu {'>'} Moje Listy, aby utworzyć pierwszą kolekcję.
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