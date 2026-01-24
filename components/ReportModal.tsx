import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (description: string) => Promise<void>;
}

const ReportModal = ({ visible, onClose, onSubmit }: ReportModalProps) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Error", "Please describe the problem.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(description);
      setDescription(''); // Wyczyść pole po wysłaniu
      onClose(); // Zamknij modal
      Alert.alert("Thank you", "Your report has been sent.");
    } catch (error) {
      Alert.alert("Error", "Failed to send report. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center bg-black/80"
      >
        <View className="bg-[#1E1E2D] w-[90%] rounded-2xl p-6 border border-white/10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Report a Problem</Text>
            <TouchableOpacity onPress={onClose}>
               <Text className="text-gray-400 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-400 text-sm mb-4">
            Briefly describe what happened. This helps us improve FlickMatch.
          </Text>

          <TextInput
            className="bg-black/20 text-white p-4 rounded-xl border border-white/10 h-32 text-base"
            placeholder="Describe the bug or issue..."
            placeholderTextColor="#666"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`mt-6 rounded-xl py-4 flex-row justify-center items-center ${isSubmitting ? 'bg-gray-600' : 'bg-secondary'}`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[#161622] font-bold text-lg">Send Report</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReportModal;