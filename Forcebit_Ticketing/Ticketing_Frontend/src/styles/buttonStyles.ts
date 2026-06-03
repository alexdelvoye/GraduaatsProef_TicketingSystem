import { colors } from "./theme";

// Shared button styles used by screens and reusable components.
export const buttonStyleDefinitions = {
  logoutButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  logoutText: {
    color: colors.primary,
    fontWeight: "600",
  },

  secondaryButton: {
    backgroundColor: colors.input,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  // Reused by header and attachment actions when the available width is too
  // small for multiple fixed-size buttons.
  secondaryButtonCompact: {
    flexGrow: 1,
    flexBasis: 120,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: colors.text,
    fontWeight: "700",
  },

  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
  },

  // Keep important actions easy to tap on compact layouts.
  primaryButtonCompact: {
    minHeight: 44,
    justifyContent: "center",
  },

  primaryButtonNarrow: {
    width: "100%",
  },

  primaryButtonText: {
    color: colors.textDark,
    fontWeight: "700",
  },

  buttonDisabled: {
    opacity: 0.6,
  },
} as const;
