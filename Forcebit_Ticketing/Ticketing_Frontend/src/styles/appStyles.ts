import { StyleSheet } from "react-native";

import { colors } from "./theme";

// Styles used by the app shell/navigation layer. Screen-specific layouts stay
// in their own style files, while this file belongs to app startup/navigation.
export const appStyles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
