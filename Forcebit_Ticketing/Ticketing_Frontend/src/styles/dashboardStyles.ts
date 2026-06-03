import { colors, layout } from "./theme";

// Dashboard list/filter styles are shared by the client home overview and the
// admin queue. They keep search and pagination controls visually consistent.
export const dashboardStyleGroup = {
  searchInput: {
    marginBottom: 14,
  },

  filterBlock: {
    marginTop: 14,
  },

  filterBlockTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  clientList: {
    gap: 10,
    marginTop: 12,
  },

  clientRow: {
    backgroundColor: colors.input,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: layout.radiusMedium,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  clientRowCompact: {
    alignItems: "flex-start",
    flexDirection: "column",
  },

  clientRowSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  clientIdentity: {
    flex: 1,
    minWidth: 0,
  },

  clientName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  clientNameSelected: {
    color: colors.textDark,
  },

  clientEmail: {
    color: colors.muted,
    fontSize: 13,
  },

  clientEmailSelected: {
    color: colors.textDark,
  },

  clientCountRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  clientCountPill: {
    backgroundColor: colors.cardSoft,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  clientCountPillSelected: {
    backgroundColor: colors.textDark,
  },

  clientCountText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },

  clientCountTextSelected: {
    color: colors.primary,
  },

  dashboardSummary: {
    color: colors.muted,
    lineHeight: 20,
  },
} as const;
