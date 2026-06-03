import { Pressable, ScrollView, Text, View } from "react-native";

import { AppHeader } from "../components/AppHeader";
import { ProfileForm } from "../forms/ProfileForm";
import { useProfileScreen } from "../hooks/useProfileScreen";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { homeStyles as styles } from "../styles/homeStyles";

import type { ProfileScreenProps } from "../types";

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const {
    user,
    signOut,
    errorMessage,
    handleUpdateProfile,
    confirmDeleteProfile,
  } = useProfileScreen();
  const { isCompact, isNarrow } = useResponsiveLayout();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isCompact ? styles.contentCompact : null,
        isNarrow ? styles.contentNarrow : null,
      ]}
    >
      <View>
        <AppHeader onBack={() => navigation.goBack()} />

        {user ? (
          <>
            <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
              <Text
                style={[styles.title, isCompact ? styles.titleCompact : null]}
              >
                Profile
              </Text>
              <Text style={styles.muted}>
                Update the contact details used for ticket communication.
              </Text>

              <ProfileForm
                user={user}
                errorMessage={errorMessage}
                onSubmit={handleUpdateProfile}
              />

              <View style={styles.profileReadOnlySection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    isCompact ? styles.sectionTitleCompact : null,
                  ]}
                >
                  Account details
                </Text>

                <View style={styles.profileDetailGrid}>
                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>Company</Text>
                    <Text style={styles.profileDetailValue}>
                      {user.companyName}
                    </Text>
                  </View>

                  <View style={styles.profileDetailItem}>
                    <Text style={styles.profileDetailLabel}>Role</Text>
                    <Text style={styles.profileDetailValue}>{user.role}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.profilePageActions,
                isCompact ? styles.profilePageActionsCompact : null,
              ]}
            >
              <Pressable
                style={[
                  styles.profileLogoutButton,
                  isCompact ? styles.profileActionButtonCompact : null,
                ]}
                onPress={() => {
                  void signOut();
                }}
              >
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>

              {user.role === "Client" ? (
                <Pressable
                  style={[
                    styles.profileDeleteButton,
                    isCompact ? styles.profileActionButtonCompact : null,
                  ]}
                  onPress={confirmDeleteProfile}
                >
                  <Text style={styles.profileDeleteButtonText}>
                    Remove account
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}
