import { SelectedAttachment } from "../types";

// The frontend mirrors the backend FileStorageOptions default. The backend
// remains the final authority, but checking here gives the user immediate
// feedback instead of a silent failed upload.
export const ATTACHMENT_UPLOAD_LIMIT_BYTES = 20 * 1024 * 1024;
export const ATTACHMENT_UPLOAD_LIMIT_LABEL = "20 MB";

export function getSingleAttachmentSizeError(attachment: SelectedAttachment) {
  if (
    attachment.size !== undefined &&
    attachment.size > ATTACHMENT_UPLOAD_LIMIT_BYTES
  ) {
    return `${attachment.name} is too large. The upload limit is ${ATTACHMENT_UPLOAD_LIMIT_LABEL} per reply.`;
  }

  return "";
}

export function getAttachmentSizeError(
  newAttachments: SelectedAttachment[],
  currentAttachments: SelectedAttachment[],
) {
  const oversizedAttachment = newAttachments.find(
    (attachment) => getSingleAttachmentSizeError(attachment) !== "",
  );

  if (oversizedAttachment) {
    return getSingleAttachmentSizeError(oversizedAttachment);
  }

  const totalKnownSize = [...currentAttachments, ...newAttachments].reduce(
    (total, attachment) => total + (attachment.size ?? 0),
    0,
  );

  if (totalKnownSize > ATTACHMENT_UPLOAD_LIMIT_BYTES) {
    return `The selected attachments are too large together. The upload limit is ${ATTACHMENT_UPLOAD_LIMIT_LABEL} per reply.`;
  }

  return "";
}
