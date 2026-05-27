import { useState } from "react";

import * as DocumentPicker from "expo-document-picker";

import { useNotifications } from "../context/NotificationContext";
import { getAttachmentSizeError } from "../utils/attachmentLimits";

import type { SelectedAttachment } from "../types";

const allowedAttachmentTypes = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
];

// The picker can be opened several times before submit. This key lets the hook
// skip the exact same selected file instead of showing duplicate rows.
function getAttachmentKey(attachment: SelectedAttachment) {
  return `${attachment.uri}:${attachment.name}:${attachment.size ?? 0}`;
}

function mapPickedAssetToAttachment(
  asset: DocumentPicker.DocumentPickerAsset,
): SelectedAttachment {
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType,
    // Expo web can put the size on asset.file instead of asset.size. Store
    // whichever value is available so validation can give immediate feedback.
    size: asset.size ?? asset.file?.size,
    file: asset.file,
  };
}

export function useAttachmentPicker(limitContext = "per message") {
  const { showError } = useNotifications();

  // This hook owns attachment state and validation. Forms receive the selected
  // files as plain data and do not need to know how Expo's document picker works.
  const [attachments, setAttachments] = useState<SelectedAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState("");

  async function pickAttachments() {
    const result = await DocumentPicker.getDocumentAsync({
      // Important for web: base64 would read the full file before returning.
      // Large files should be rejected by size validation before being loaded.
      base64: false,
      copyToCacheDirectory: true,
      multiple: true,
      type: allowedAttachmentTypes,
    });

    if (result.canceled) {
      return;
    }

    const knownAttachmentKeys = new Set(attachments.map(getAttachmentKey));
    const pickedAttachments = result.assets.map(mapPickedAssetToAttachment);
    const newAttachments = pickedAttachments.filter(
      (attachment) => !knownAttachmentKeys.has(getAttachmentKey(attachment)),
    );

    const sizeError = getAttachmentSizeError(
      newAttachments,
      attachments,
      limitContext,
    );

    if (sizeError) {
      setAttachmentError(sizeError);
      showError("Attachment too large", sizeError);
      return;
    }

    setAttachmentError("");
    setAttachments((currentAttachments) => [
      ...currentAttachments,
      ...newAttachments,
    ]);
  }

  function clearAttachments() {
    setAttachments([]);
    setAttachmentError("");
  }

  return {
    attachments,
    attachmentError,
    pickAttachments,
    clearAttachments,
  };
}
