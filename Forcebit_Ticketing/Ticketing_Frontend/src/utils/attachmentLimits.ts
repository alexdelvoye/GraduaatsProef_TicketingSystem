import type { SelectedAttachment } from "../types";

// The frontend mirrors the backend FileStorageOptions default. The backend
// remains the final authority, but checking here gives the user immediate
// feedback instead of a silent failed upload.
export const ATTACHMENT_UPLOAD_LIMIT_BYTES = 20 * 1024 * 1024;
export const ATTACHMENT_UPLOAD_LIMIT_LABEL = "20 MB";

export type AttachmentUploadUsage = {
  usedBytes: number;
  remainingBytes: number;
  usedLabel: string;
  remainingLabel: string;
  hasUnknownSizes: boolean;
};

export function formatAttachmentSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes >= 10 ? 0 : 1)} KB`;
  }

  const megabytes = kilobytes / 1024;

  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

export function getAttachmentUploadUsage(
  attachments: SelectedAttachment[],
): AttachmentUploadUsage {
  // Some native pickers may not report size. The summary therefore uses the
  // known sizes while the backend remains the final authority for the upload.
  const usedBytes = attachments.reduce(
    (total, attachment) => total + (attachment.size ?? 0),
    0,
  );
  const remainingBytes = Math.max(0, ATTACHMENT_UPLOAD_LIMIT_BYTES - usedBytes);

  return {
    usedBytes,
    remainingBytes,
    usedLabel: formatAttachmentSize(usedBytes),
    remainingLabel: formatAttachmentSize(remainingBytes),
    hasUnknownSizes: attachments.some(
      (attachment) => attachment.size === undefined,
    ),
  };
}

export function getSingleAttachmentSizeError(
  attachment: SelectedAttachment,
  limitContext = "per message",
) {
  if (
    attachment.size !== undefined &&
    attachment.size > ATTACHMENT_UPLOAD_LIMIT_BYTES
  ) {
    return `${attachment.name} is too large. The upload limit is ${ATTACHMENT_UPLOAD_LIMIT_LABEL} ${limitContext}.`;
  }

  return "";
}

export function getAttachmentSizeError(
  newAttachments: SelectedAttachment[],
  currentAttachments: SelectedAttachment[],
  limitContext = "per message",
) {
  const oversizedAttachment = newAttachments.find(
    (attachment) =>
      getSingleAttachmentSizeError(attachment, limitContext) !== "",
  );

  if (oversizedAttachment) {
    return getSingleAttachmentSizeError(oversizedAttachment, limitContext);
  }

  const totalKnownSize = [...currentAttachments, ...newAttachments].reduce(
    (total, attachment) => total + (attachment.size ?? 0),
    0,
  );

  if (totalKnownSize > ATTACHMENT_UPLOAD_LIMIT_BYTES) {
    return `The selected attachments are too large together. The upload limit is ${ATTACHMENT_UPLOAD_LIMIT_LABEL} ${limitContext}.`;
  }

  return "";
}
