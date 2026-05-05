import { StyleSheet } from "react-native";
import { colors } from "./theme";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 56,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  logoutButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  logoutText: {
    color: colors.primary,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 24,
  },
  label: {
    color: colors.muted,
    marginTop: 10,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    marginTop: 4,
  },
  role: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  muted: {
    color: colors.muted,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#111236",
    fontWeight: "700",
  },
});
