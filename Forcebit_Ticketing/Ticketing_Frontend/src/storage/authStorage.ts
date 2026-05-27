import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Utility functions to manage authentication-related data in storage, using localStorage for web and SecureStore for native platforms
export async function getAuthItem(key: string) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

// Utility function to set an authentication-related item in storage, using localStorage for web and SecureStore for native platforms
export async function setAuthItem(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

// Utility function to delete an authentication-related item from storage, using localStorage for web and SecureStore for native platforms
export async function deleteAuthItem(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
