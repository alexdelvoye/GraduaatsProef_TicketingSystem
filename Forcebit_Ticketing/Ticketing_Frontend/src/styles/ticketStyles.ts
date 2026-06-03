import { colors, layout } from "./theme";

// Styles for ticket lists, status pills and conversation messages.
export const ticketStyleGroup = {
  ticketSection: {
    marginBottom: 24,
  },

  ticketSectionCompact: {
    marginBottom: 18,
  },

  ticketCard: {
    backgroundColor: colors.card,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: layout.radiusMedium,
    padding: 18,
    marginBottom: 12,
  },

  ticketCardCompact: {
    padding: 14,
  },

  ticketCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },

  ticketCardHeaderCompact: {
    flexWrap: "wrap",
    gap: 8,
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

  statusPillCompact: {
    alignSelf: "flex-start",
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

  // Conversation rows control left/right alignment. The bubble itself owns the
  // color and tail-like corner radius for client/admin distinction.
  messageRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 12,
  },

  adminMessageRow: {
    justifyContent: "flex-end",
  },

  messageCard: {
    maxWidth: "78%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },

  // Chat bubbles get wider as the viewport shrinks. That keeps messages and
  // image previews readable instead of creating tall, skinny columns.
  messageCardCompact: {
    maxWidth: "88%",
  },

  messageCardNarrow: {
    maxWidth: "100%",
  },

  clientMessageCard: {
    backgroundColor: colors.cardSoft,
    borderColor: colors.inputBorder,
    borderTopLeftRadius: 6,
  },

  adminMessageCard: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderTopRightRadius: 6,
  },

  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },

  messageHeaderCompact: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 2,
  },

  messageSender: {
    color: colors.text,
    fontWeight: "700",
  },

  adminMessageSender: {
    color: colors.textDark,
  },

  adminMessageDate: {
    color: colors.mutedDark,
  },

  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },

  adminMessageText: {
    color: colors.textDark,
  },
} as const;
