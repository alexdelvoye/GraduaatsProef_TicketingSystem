import { colors } from "./theme";

// Form control styles shared by ticket/profile forms and small option groups.
export const formStyleDefinitions = {
  label: {
    color: colors.muted,
    marginTop: 14,
    marginBottom: 8,
  },

  input: {
    backgroundColor: colors.input,
    color: colors.text,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },

  inputError: {
    borderColor: colors.danger,
    borderWidth: 1,
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

  optionGridCompact: {
    gap: 8,
  },

  optionButton: {
    backgroundColor: colors.input,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  optionButtonCompact: {
    flexGrow: 1,
    minHeight: 44,
    justifyContent: "center",
  },

  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  optionButtonText: {
    color: colors.text,
    fontWeight: "700",
  },

  optionButtonTextSelected: {
    color: colors.textDark,
  },

  optionSubtext: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },

  optionSubtextSelected: {
    color: colors.textDark,
  },

  fieldErrorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 8,
  },
} as const;
