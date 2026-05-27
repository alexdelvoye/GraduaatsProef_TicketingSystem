import { Platform } from "react-native";

import { API_URL, ApiError } from "./apiClient";

import { getAuthItem } from "../storage/authStorage";
import { TicketAttachment } from "../types";

// Protected download for an attachment already shown in the conversation.
// The file is fetched with the JWT token, then the browser receives a temporary
// object URL so the user can save/open the file.
export async function downloadTicketAttachment(
  ticketId: string,
  attachment: TicketAttachment,
) {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    throw new ApiError("Attachment downloads are currently supported on web.");
  }

  const token = await getAuthItem("token");
  const response = await fetch(
    `${API_URL}/tickets/${ticketId}/attachments/${attachment.id}/download`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    throw new ApiError("Could not download this attachment.", response.status);
  }

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.download = attachment.fileName;
  downloadLink.click();
  URL.revokeObjectURL(downloadUrl);
}
