import { colors } from "./theme";

// Shared pagination styles are used first by the ticket conversation. The same
// controls can later be placed under client and ticket lists.
export const paginationStyleGroup = {
  paginationBar: {
    backgroundColor: colors.card,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  paginationBarNarrow: {
    alignItems: "stretch",
    flexDirection: "column",
  },

  paginationSummary: {
    color: colors.text,
    fontWeight: "700",
  },

  paginationSubtext: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },

  paginationActions: {
    flexDirection: "row",
    gap: 8,
  },

  paginationActionsNarrow: {
    flexWrap: "wrap",
  },

  paginationButton: {
    minWidth: 104,
    alignItems: "center",
  },
} as const;
