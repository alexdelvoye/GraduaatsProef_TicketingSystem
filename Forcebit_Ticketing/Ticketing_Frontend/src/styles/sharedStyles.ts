import { colors, layout } from "./theme";

// Page-level and typography styles shared by the ticket/admin/profile screens.
// More specific groups such as buttons, forms and tickets live in their own
// style definition files and are combined by homeStyles.
export const sharedStyleDefinitions = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    width: "100%",
    maxWidth: layout.pageMaxWidth,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },

  hero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 30,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },

  card: {
    backgroundColor: colors.card,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: layout.radiusLarge,
    padding: 22,
    marginBottom: 18,
  },

  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "600",
    marginBottom: 8,
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
    fontSize: 24,
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

  emptyText: {
    color: colors.muted,
    backgroundColor: colors.card,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: layout.radiusMedium,
    padding: 16,
  },

  loadingState: {
    paddingVertical: 40,
    alignItems: "center",
  },

  errorText: {
    color: colors.danger,
    marginBottom: 12,
    fontWeight: "600",
  },
} as const;
