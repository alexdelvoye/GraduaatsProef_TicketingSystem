import { Pressable, ScrollView, Text, View } from "react-native";

import { AppHeader } from "../components/AppHeader";
import { ProfileForm } from "../forms/ProfileForm";
import { useProfileScreen } from "../hooks/useProfileScreen";
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View>
        <AppHeader onBack={() => navigation.goBack()} />

        {user ? (
          <>
            <View style={styles.card}>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.muted}>
                Update the contact details used for ticket communication.
              </Text>

              <ProfileForm
                user={user}
                errorMessage={errorMessage}
                onSubmit={handleUpdateProfile}
              />

              <View style={styles.profileReadOnlySection}>
                <Text style={styles.sectionTitle}>Account details</Text>

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

            <View style={styles.profilePageActions}>
              <Pressable
                style={styles.profileLogoutButton}
                onPress={() => {
                  void signOut();
                }}
              >
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>

              {user.role === "Client" ? (
                <Pressable
                  style={styles.profileDeleteButton}
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
