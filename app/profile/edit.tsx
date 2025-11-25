import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { deleteFile, updateUserAvatar, updateUserName, uploadFile } from '@/services/appwriteapi';

const EditProfile = () => {
  const { user, setUser } = useGlobalContext();
  
  const rawAvatar = (user?.prefs as any)?.avatar;
  const userAvatar = typeof rawAvatar === 'string' ? rawAvatar : null;

  const [username, setUsername] = useState(user?.name || '');
  const [image, setImage] = useState<{ uri: string } | null>(
    userAvatar ? { uri: userAvatar } : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const submit = async () => {
    if (!user) return;
    if (!username) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      let avatarUrl: string | null = userAvatar;

      if (image && image.uri !== userAvatar && !image.uri.startsWith('http')) {
        const file = {
          uri: image.uri,
          name: `profile_${user.$id}.jpg`,
          type: 'image/jpeg',
        };
        
        const uploadedUrl = await uploadFile(file);

        if (!uploadedUrl) {
           throw new Error("Failed to upload image");
        }

        if (avatarUrl) {
            const fileIdMatch = avatarUrl.match(/files\/([^/]+)\//);
            if (fileIdMatch && fileIdMatch[1]) {
                await deleteFile(fileIdMatch[1]);
            }
        }

        avatarUrl = uploadedUrl; 
        
        await updateUserAvatar(avatarUrl);
      }

      const updatedUser = await updateUserName(username);
      
      setUser((prev: any) => ({
        ...prev,
        name: updatedUser.name,
        prefs: { ...prev.prefs, avatar: avatarUrl }
      }));

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Image 
              source={icons.left_arrow} 
              className="w-6 h-6" 
              resizeMode="contain" 
              style={{ tintColor: '#fff' }}
            />
          </TouchableOpacity>
          <Text className="text-2xl text-white font-bold">Edit Profile</Text>
        </View>

        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickImage}>
            <View className="w-24 h-24 rounded-full border-2 border-secondary justify-center items-center bg-black-100 mb-4 overflow-hidden">
              {image?.uri ? (
                <Image 
                  source={{ uri: image.uri }} 
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
          </TouchableOpacity>
          <Text className="text-secondary font-semibold" onPress={pickImage}>
            Change Profile Picture
          </Text>
        </View>

        <View className="space-y-2">
          <Text className="text-base text-gray-100 font-medium">Username</Text>
          <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row">
            <TextInput 
              className="flex-1 text-white font-semibold text-base"
              value={username}
              placeholder="Enter your username"
              placeholderTextColor="#7b7b8b"
              onChangeText={setUsername}
            />
          </View>
        </View>

        <View className="mt-8">
            <TouchableOpacity 
            onPress={() => router.push('/profile/change-password')}
            className="border-2 border-secondary rounded-xl min-h-[62px] justify-center items-center"
            >
            <Text className="text-secondary font-bold text-lg">Change Password</Text>
            </TouchableOpacity>
        </View>

        <View className="mt-4">
            <TouchableOpacity 
            onPress={submit}
            className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
            >
            <Text className="text-primary font-bold text-lg">Save Changes</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;