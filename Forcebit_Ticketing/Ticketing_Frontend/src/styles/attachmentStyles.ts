import { colors } from "./theme";

// Attachment UI is used in both ticket creation and replies, so these styles
// live with the shared style groups instead of inside one screen stylesheet.
export const attachmentStyleGroup = {
  attachmentActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },

  attachmentList: {
    gap: 10,
    marginTop: 12,
  },

  attachmentHelpText: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 8,
  },

  attachmentErrorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },

  attachmentText: {
    color: colors.text,
    backgroundColor: colors.input,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 13,
  },

  attachmentDownloadButton: {
    backgroundColor: colors.input,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  attachmentDownloadText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  // Message attachments can contain an inline image preview followed by the
  // normal download button, so they need their own vertical spacing.
  messageAttachment: {
    gap: 6,
  },

  // Fixed preview height prevents large screenshots from resizing the whole
  // conversation unpredictably.
  attachmentPreviewImage: {
    width: "100%",
    height: 180,
    backgroundColor: colors.backgroundDeep,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
  },

  attachmentPreviewImageCompact: {
    height: 150,
  },
} as const;
