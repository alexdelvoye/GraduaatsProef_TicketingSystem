import { StyleSheet } from "react-native";
import { colors } from "./theme";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    gap: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  hero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  logoutButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  logoutWideButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  logoutText: {
    color: colors.primary,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: colors.input,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#111236",
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    color: colors.muted,
    marginTop: 14,
    marginBottom: 8,
  },
  value: {
    color: colors.text,
    fontSize: 16,
  },
  role: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  muted: {
    color: colors.muted,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "600",
    marginBottom: 4,
  },
  countBadge: {
    backgroundColor: colors.input,
    color: colors.text,
    borderRadius: 999,
    minWidth: 34,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: "center",
    fontWeight: "700",
  },
  ticketSection: {
    marginBottom: 24,
  },
  ticketCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  ticketCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  ticketTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  ticketTitleBlock: {
    flex: 1,
  },
  statusPill: {
    backgroundColor: colors.primary,
    color: "#111236",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "700",
  },
  statusPillClosed: {
    backgroundColor: colors.input,
    color: colors.muted,
  },
  ticketMeta: {
    color: colors.text,
    marginBottom: 6,
  },
  ticketDate: {
    color: colors.muted,
    fontSize: 13,
  },
  description: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 18,
  },
  messageCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  adminMessageCard: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  messageSender: {
    color: colors.text,
    fontWeight: "700",
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyText: {
    color: colors.muted,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
  },
  loadingState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  input: {
    backgroundColor: colors.input,
    color: colors.text,
    borderRadius: 10,
    padding: 14,
  },
  textArea: {
    minHeight: 140,
    marginBottom: 16,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  optionButton: {
    backgroundColor: colors.input,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  optionButtonTextSelected: {
    color: "#111236",
  },
  optionSubtext: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  optionSubtextSelected: {
    color: "#111236",
  },
  errorText: {
    color: colors.danger,
    marginBottom: 12,
    fontWeight: "600",
  },
});
