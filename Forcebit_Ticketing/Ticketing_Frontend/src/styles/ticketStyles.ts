import { colors, layout } from "./theme";

// Styles for ticket lists, status pills and conversation messages.
export const ticketStyleDefinitions = {
  ticketSection: {
    marginBottom: 24,
  },

  ticketCard: {
    backgroundColor: colors.card,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: layout.radiusMedium,
    padding: 18,
    marginBottom: 12,
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
    backgroundColor: colors.cardSoft,
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

  messageCard: {
    backgroundColor: colors.card,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: layout.radiusMedium,
    padding: 18,
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
} as const;
