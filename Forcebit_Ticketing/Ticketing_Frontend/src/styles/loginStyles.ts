import { StyleSheet } from "react-native";
import { colors, layout } from "./theme";

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: layout.formMaxWidth,
    backgroundColor: colors.card,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: layout.radiusLarge,
    padding: 28,
  },
  logo: {
    color: colors.text,
    fontSize: 24,
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
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textDark,
    fontWeight: "700",
  },
  link: {
    color: colors.primary,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  fieldErrorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
    marginTop: -6,
    marginBottom: 12,
  },
});
