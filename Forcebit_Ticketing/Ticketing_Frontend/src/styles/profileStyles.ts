import { colors } from "./theme";

// Profile-specific layout stays out of the generic ticket/dashboard styles.
export const profileStyleDefinitions = {
  profilePageActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 2,
  },

  profileLogoutButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    minWidth: 220,
  },

  profileDeleteButton: {
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    minWidth: 220,
  },

  profileDeleteButtonText: {
    color: colors.danger,
    fontWeight: "700",
  },

  profileFormActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 24,
    marginBottom: 24,
  },

  profileSaveButton: {
    minWidth: 190,
  },

  profileReadOnlySection: {
    borderTopColor: colors.inputBorder,
    borderTopWidth: 1,
    paddingTop: 20,
  },

  profileDetailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },

  profileDetailItem: {
    flexGrow: 1,
    flexBasis: 260,
    backgroundColor: colors.backgroundDeep,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },

  profileDetailLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },

  profileDetailValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
} as const;
