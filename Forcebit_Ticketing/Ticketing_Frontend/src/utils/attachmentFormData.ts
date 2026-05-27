import { Platform } from "react-native";

import { ApiError } from "../api/apiClient";

import { getSingleAttachmentSizeError } from "./attachmentLimits";

import type { SelectedAttachment } from "../types";

// FormData file values differ between platforms:
// - Expo web/browser wants a Blob or File.
// - React Native accepts an object with uri/name/type.
// Keeping this in a utility prevents every API function from needing to know
// those platform details.
export async function appendAttachmentToFormData(
  formData: FormData,
  attachment: SelectedAttachment,
) {
  const knownSizeError = getSingleAttachmentSizeError(attachment);

  if (knownSizeError) {
    throw new ApiError(knownSizeError);
  }

  if (attachment.file) {
    formData.append("files", attachment.file, attachment.name);
    return;
  }

  if (Platform.OS === "web") {
    const fileResponse = await fetch(attachment.uri);
    const fileBlob = await fileResponse.blob();
    const blobSizeError = getSingleAttachmentSizeError({
      ...attachment,
      size: fileBlob.size,
    });

    if (blobSizeError) {
      throw new ApiError(blobSizeError);
    }

    formData.append("files", fileBlob, attachment.name);
    return;
  }

  formData.append("files", {
    uri: attachment.uri,
    name: attachment.name,
    type: attachment.mimeType || "application/octet-stream",
  } as unknown as Blob);
}
