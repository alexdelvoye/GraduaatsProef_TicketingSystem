import { colors, layout } from "./theme";

// Header styles belong to AppHeader. They are kept separate from screen styles
// because the same branded header appears on several pages.
export const headerStyleDefinitions = {
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: colors.card,
    borderRadius: layout.radiusLarge,
    paddingVertical: 22,
    paddingHorizontal: 28,
    marginBottom: 44,
    gap: 12,
  },

  headerCompact: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerActionsCompact: {
    width: "100%",
    flexWrap: "wrap",
  },

  logo: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0,
  },

  logoCompact: {
    fontSize: 22,
  },
} as const;
