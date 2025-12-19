import { useState } from "react";
import { Image, TextInput, TouchableOpacity } from "react-native";

import { icons } from "@/constants/icons";

interface Props {
  placeholder: string;
  value?: string;                      // <--- ZMIANA: Opcjonalne (?)
  onChangeText?: (text: string) => void; // <--- ZMIANA: Opcjonalne (?)
  onPress?: () => void;
  autoFocus?: boolean;
}

const SearchBar = ({ 
  placeholder, 
  value, 
  onChangeText, 
  onPress, 
  autoFocus = false 
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  // Sprawdzamy, czy komponent działa jako przycisk (czy ma funkcję onPress, a nie ma onChangeText)
  // Jeśli tak, blokujemy edycję tekstu, żeby klawiatura nie wyskakiwała na Home Screenie.
  const isButtonMode = !!onPress && !onChangeText;

  return (
    <TouchableOpacity
        // Jeśli to tryb przycisku, cały pasek reaguje na dotyk
        activeOpacity={isButtonMode ? 0.7 : 1}
        onPress={onPress}
        className={`flex-row items-center w-full h-16 px-4 bg-white/10 rounded-2xl border-2 space-x-4 ${
            isFocused ? "border-yellow-500" : "border-secondary"
        }`}
    >
      <Image
        source={icons.search}
        className="w-5 h-5"
        resizeMode="contain"
        tintColor="#CDCDE0"
      />

      <TextInput
        value={value || ""} // Fallback do pustego stringa
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#CDCDE0"
        autoFocus={autoFocus}
        editable={!isButtonMode} // <--- Blokujemy edycję, jeśli to tylko przycisk nawigacji
        
        // Obsługa fokusu
        onFocus={() => setIsFocused(true)} 
        onBlur={() => setIsFocused(false)}
        
        // Ważne: pointerEvents="none" dla inputa w trybie przycisku, 
        // żeby kliknięcie przechodziło do TouchableOpacity
        pointerEvents={isButtonMode ? "none" : "auto"}
        
        className="text-base mt-0.5 text-white flex-1 font-pregular"
      />

      {/* Przycisk czyszczenia (X) - tylko w trybie edycji */}
      {!isButtonMode && value && value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText && onChangeText("")}>
            <Image 
                source={icons.close || icons.plus} 
                className="w-5 h-5"
                resizeMode="contain"
                tintColor="#CDCDE0"
                style={!icons.close ? { transform: [{ rotate: '45deg' }] } : undefined}
            />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default SearchBar;