import { Platform } from "react-native";

import * as SecureStore from "expo-secure-store";

// Expo SecureStore works on native devices, while localStorage is available in
// the browser. These helpers hide that platform difference from AuthContext.
export async function getAuthItem(key: string) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

export async function setAuthItem(key: string, value: string) {
  if (Platform.OS === "web") {
    // Web storage is synchronous, so we return after writing.
    localStorage.setItem(key, value);
    return;
  }

  // SecureStore is asynchronous on native platforms.
  await SecureStore.setItemAsync(key, value);
}

export async function deleteAuthItem(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
