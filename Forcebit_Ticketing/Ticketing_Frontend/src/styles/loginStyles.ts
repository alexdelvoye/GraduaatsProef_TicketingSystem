import { StyleSheet } from "react-native";

import { authSharedStyleDefinitions } from "./authSharedStyles";
import { colors } from "./theme";

// Login uses a KeyboardAvoidingView, so its container fills and centers the
// viewport. The shared auth card/input/button styles are reused below.
export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  authContainerCompact: {
    padding: 16,
  },

  ...authSharedStyleDefinitions,
});
