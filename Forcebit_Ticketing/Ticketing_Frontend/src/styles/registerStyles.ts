import { StyleSheet } from "react-native";

import { authSharedStyleDefinitions } from "./authSharedStyles";
import { colors } from "./theme";

// Register is inside a ScrollView so the longer form stays reachable on smaller
// screens. The actual card/input/button styling is shared with login.
export const registerStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  ...authSharedStyleDefinitions,
});
