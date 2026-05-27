import { Pressable, Text, View } from "react-native";

import { homeStyles as styles } from "../styles/homeStyles";

type AppHeaderProps = {
  onBack?: () => void;
  onProfile?: () => void;
  onLogout?: () => void;
};

export function AppHeader({ onBack, onProfile, onLogout }: AppHeaderProps) {
  return (
    // Shared screen header. Screens decide which actions are available, but the
    // visual structure and FORCEBIT branding stay in one reusable component.
    <View style={styles.header}>
      <Text style={styles.logo}>FORCEBIT</Text>

      {onBack ? (
        <Pressable onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      ) : (
        <View style={styles.headerActions}>
          {onProfile ? (
            <Pressable onPress={onProfile} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Profile</Text>
            </Pressable>
          ) : null}

          {onLogout ? (
            <Pressable onPress={onLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}
