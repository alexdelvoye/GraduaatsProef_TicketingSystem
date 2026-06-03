import { Pressable, Text, View } from "react-native";

import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { homeStyles as styles } from "../styles/homeStyles";
import {
  ATTACHMENT_UPLOAD_LIMIT_LABEL,
  formatAttachmentSize,
} from "../utils/attachmentLimits";

import type { SelectedAttachment } from "../types";
import type { AttachmentUploadUsage } from "../utils/attachmentLimits";

type AttachmentPickerProps = {
  attachments: SelectedAttachment[];
  attachmentError: string;
  attachmentUsage: AttachmentUploadUsage;
  disabled?: boolean;
  limitLabel: string;
  onPickAttachments: () => void;
  onClearAttachments: () => void;
  onRemoveAttachment: (attachment: SelectedAttachment) => void;
};

function getAttachmentRowKey(attachment: SelectedAttachment) {
  return `${attachment.uri}:${attachment.name}:${attachment.size ?? 0}`;
}

export function AttachmentPicker({
  attachments,
  attachmentError,
  attachmentUsage,
  disabled = false,
  limitLabel,
  onPickAttachments,
  onClearAttachments,
  onRemoveAttachment,
}: AttachmentPickerProps) {
  // Attachment action buttons become flexible on phone-width layouts so long
  // labels do not overflow or create cramped controls.
  const { isNarrow } = useResponsiveLayout();

  return (
    // This component only renders the attachment controls. The picker state,
    // duplicate detection and size validation live in useAttachmentPicker.
    <View style={styles.attachmentPickerBlock}>
      <View style={styles.attachmentActions}>
        <Pressable
          style={[
            styles.secondaryButton,
            isNarrow ? styles.secondaryButtonCompact : null,
            disabled && styles.buttonDisabled,
          ]}
          onPress={onPickAttachments}
          disabled={disabled}
        >
          <Text style={styles.secondaryButtonText}>Add attachments</Text>
        </Pressable>

        {attachments.length > 0 ? (
          <Pressable
            style={[
              styles.secondaryButton,
              isNarrow ? styles.secondaryButtonCompact : null,
              disabled && styles.buttonDisabled,
            ]}
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

      {attachments.length > 0 ? (
        <>
          <Text style={styles.attachmentUsageText}>
            {attachmentUsage.hasUnknownSizes ? "Known selected" : "Selected"}:{" "}
            {attachmentUsage.usedLabel} of {ATTACHMENT_UPLOAD_LIMIT_LABEL}.
            Remaining: {attachmentUsage.remainingLabel}.
          </Text>

          {attachmentUsage.hasUnknownSizes ? (
            <Text style={styles.attachmentHelpText}>
              Some file sizes are unknown here, but the backend still checks the
              final upload size.
            </Text>
          ) : null}
        </>
      ) : null}

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
            <View
              key={getAttachmentRowKey(attachment)}
              style={styles.attachmentRow}
            >
              <Text style={styles.attachmentFileName}>
                {attachment.name}
                {attachment.size !== undefined
                  ? ` (${formatAttachmentSize(attachment.size)})`
                  : ""}
              </Text>
              <Pressable
                accessibilityLabel={`Remove ${attachment.name}`}
                accessibilityRole="button"
                hitSlop={6}
                style={[
                  styles.attachmentRemoveButton,
                  disabled && styles.buttonDisabled,
                ]}
                onPress={() => onRemoveAttachment(attachment)}
                disabled={disabled}
              >
                <View style={styles.attachmentRemoveIconFrame}>
                  <View style={styles.attachmentRemoveIconLine} />
                  <View
                    style={[
                      styles.attachmentRemoveIconLine,
                      styles.attachmentRemoveIconLineReverse,
                    ]}
                  />
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
