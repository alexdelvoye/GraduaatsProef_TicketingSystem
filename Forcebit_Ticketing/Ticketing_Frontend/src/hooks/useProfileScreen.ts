import { Alert, Platform } from "react-native";

import { deleteProfile, updateProfile } from "../apis/profileApi";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import { useErrorHandler } from "./useErrorHandler";

import type { ProfileFormValues } from "../validation/profileSchema";

export function useProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const { showSuccess } = useNotifications();
  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not update your profile.",
  );
  const accountRemovalMessage =
    "This removes your account and your tickets. This cannot be undone.";

  async function handleUpdateProfile(values: ProfileFormValues) {
    try {
      clearError();

      const updatedUser = await updateProfile({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
      });

      await updateUser(updatedUser);
      showSuccess("Profile updated", "Your name and email were saved.");
    } catch (error) {
      handleError(error);
    }
  }

  async function handleDeleteProfile() {
    try {
      clearError();

      await deleteProfile();

      // The deleted account can no longer use its JWT, so remove the local
      // session immediately and show the more specific account-removal toast.
      await signOut(false);
      showSuccess("Account removed", "Your account was deleted.");
    } catch (error) {
      handleError(error, "Could not remove your account.");
    }
  }

  function confirmDeleteProfile() {
    // React Native Alert is used on mobile. On web, window.confirm gives a
    // native browser confirmation dialog with Cancel/OK behavior.
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm(accountRemovalMessage)) {
        void handleDeleteProfile();
      }

      return;
    }

    Alert.alert("Remove account", accountRemovalMessage, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove account",
        style: "destructive",
        onPress: () => {
          void handleDeleteProfile();
        },
      },
    ]);
  }

  return {
    user,
    signOut,
    errorMessage,
    handleUpdateProfile,
    confirmDeleteProfile,
  };
}
