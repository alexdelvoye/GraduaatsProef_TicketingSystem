import { Pressable, Text, View } from "react-native";

import { homeStyles as styles } from "../styles/homeStyles";
import { ATTACHMENT_UPLOAD_LIMIT_LABEL } from "../utils/attachmentLimits";

import type { SelectedAttachment } from "../types";

type AttachmentPickerProps = {
  attachments: SelectedAttachment[];
  attachmentError: string;
  disabled?: boolean;
  limitLabel: string;
  onPickAttachments: () => void;
  onClearAttachments: () => void;
};

function getAttachmentRowKey(attachment: SelectedAttachment) {
  return `${attachment.uri}:${attachment.name}:${attachment.size ?? 0}`;
}

export function AttachmentPicker({
  attachments,
  attachmentError,
  disabled = false,
  limitLabel,
  onPickAttachments,
  onClearAttachments,
}: AttachmentPickerProps) {
  return (
    // This component only renders the attachment controls. The picker state,
    // duplicate detection and size validation live in useAttachmentPicker.
    <>
      <View style={styles.attachmentActions}>
        <Pressable
          style={[styles.secondaryButton, disabled && styles.buttonDisabled]}
          onPress={onPickAttachments}
          disabled={disabled}
        >
          <Text style={styles.secondaryButtonText}>Add attachments</Text>
        </Pressable>

        {attachments.length > 0 ? (
          <Pressable
            style={[styles.secondaryButton, disabled && styles.buttonDisabled]}
            onPress={onClearAttachments}
            disabled={disabled}
          >
            <Text style={styles.secondaryButtonText}>Clear files</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.attachmentHelpText}>
        Upload limit: {ATTACHMENT_UPLOAD_LIMIT_LABEL} {limitLabel}.
      </Text>

      {attachmentError ? (
        <Text style={styles.attachmentErrorText}>{attachmentError}</Text>
      ) : null}

      {attachments.length > 0 ? (
        <View style={styles.attachmentList}>
          <Text style={styles.attachmentText}>
            {attachments.length} file{attachments.length === 1 ? "" : "s"}{" "}
            selected
          </Text>

          {attachments.map((attachment) => (
            <Text
              key={getAttachmentRowKey(attachment)}
              style={styles.attachmentText}
            >
              {attachment.name}
            </Text>
          ))}
        </View>
      ) : null}
    </>
  );
}
