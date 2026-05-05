import { StyleSheet } from "react-native";
import { colors } from "./theme";

export const registerStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 24,
  },
  logo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 32,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.input,
    color: colors.text,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#111236",
    fontWeight: "700",
  },
  link: {
    color: colors.primary,
    textAlign: "center",
    marginTop: 20,
  },
});
