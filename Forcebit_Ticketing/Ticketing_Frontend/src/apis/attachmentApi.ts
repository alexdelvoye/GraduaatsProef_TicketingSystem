import { Platform } from "react-native";

import { API_URL, ApiError } from "./apiClient";

import { getAuthItem } from "../storage/authStorage";

import type { TicketAttachment } from "../types";

function getAttachmentDownloadUrl(ticketId: string, attachmentId: string) {
  return `${API_URL}/tickets/${ticketId}/attachments/${attachmentId}/download`;
}

// Image previews and normal downloads both use this helper because attachments
// are private. A plain Image URL cannot send the JWT header, so the file is
// fetched first and then exposed to the UI as a temporary object URL.
async function fetchProtectedAttachmentBlob(
  ticketId: string,
  attachment: TicketAttachment,
) {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    throw new ApiError(
      "Attachment previews and downloads are currently supported on web.",
    );
  }

  const token = await getAuthItem("token");
  const response = await fetch(
    getAttachmentDownloadUrl(ticketId, attachment.id),
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    throw new ApiError("Could not load this attachment.", response.status);
  }

  return response.blob();
}

export function isPreviewableImageAttachment(attachment: TicketAttachment) {
  // Prefer the content type, but keep the filename fallback because uploaded
  // files can arrive with a generic browser/native MIME type.
  const fileName = attachment.fileName.toLowerCase();
  const contentType = attachment.contentType.toLowerCase();

  return (
    contentType === "image/png" ||
    contentType === "image/jpeg" ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg")
  );
}

// Protected image previews use the same secured download endpoint as normal
// downloads. The JWT is sent with fetch, then the UI receives a temporary
// object URL that can be used by an Image component.
export async function createAttachmentPreviewUrl(
  ticketId: string,
  attachment: TicketAttachment,
) {
  if (!isPreviewableImageAttachment(attachment)) {
    return null;
  }

  const blob = await fetchProtectedAttachmentBlob(ticketId, attachment);

  return URL.createObjectURL(blob);
}

// Protected download for an attachment already shown in the conversation.
// The file is fetched with the JWT token, then the browser receives a temporary
// object URL so the user can save/open the file.
export async function downloadTicketAttachment(
  ticketId: string,
  attachment: TicketAttachment,
) {
  const blob = await fetchProtectedAttachmentBlob(ticketId, attachment);
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.download = attachment.fileName;
  downloadLink.click();
  URL.revokeObjectURL(downloadUrl);
}
