import { Pressable, Text, View } from "react-native";

import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { homeStyles as styles } from "../styles/homeStyles";

type AppHeaderProps = {
  onBack?: () => void;
  onProfile?: () => void;
  onLogout?: () => void;
};

export function AppHeader({ onBack, onProfile, onLogout }: AppHeaderProps) {
  // Compact reduces the header padding. Narrow lets action buttons wrap to
  // usable touch targets instead of squeezing side by side.
  const { isCompact, isNarrow } = useResponsiveLayout();

  return (
    // Shared screen header. Screens decide which actions are available, but the
    // visual structure and FORCEBIT branding stay in one reusable component.
    <View style={[styles.header, isCompact ? styles.headerCompact : null]}>
      <Text style={[styles.logo, isCompact ? styles.logoCompact : null]}>
        FORCEBIT
      </Text>

      {onBack ? (
        <Pressable
          onPress={onBack}
          style={[
            styles.secondaryButton,
            isNarrow ? styles.secondaryButtonCompact : null,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      ) : (
        <View
          style={[
            styles.headerActions,
            isNarrow ? styles.headerActionsCompact : null,
          ]}
        >
          {onProfile ? (
            <Pressable
              onPress={onProfile}
              style={[
                styles.secondaryButton,
                isNarrow ? styles.secondaryButtonCompact : null,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Profile</Text>
            </Pressable>
          ) : null}

          {onLogout ? (
            <Pressable
              onPress={onLogout}
              style={[
                styles.logoutButton,
                isNarrow ? styles.secondaryButtonCompact : null,
              ]}
            >
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}
