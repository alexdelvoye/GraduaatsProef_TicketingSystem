import { useState } from "react";

import * as DocumentPicker from "expo-document-picker";
import { Formik, FormikHelpers } from "formik";
import { Pressable, Text, View } from "react-native";

import { FormTextInput } from "./FormTextInput";
import { submitFormWithValidationToast } from "./formErrorHelpers";

import { useNotifications } from "../context/NotificationContext";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { SelectedAttachment } from "../types";
import {
  ATTACHMENT_UPLOAD_LIMIT_LABEL,
  getAttachmentSizeError,
} from "../utils/attachmentLimits";
import {
  TicketMessageFormValues,
  ticketMessageSchema,
} from "../validation/ticketSchema";

type TicketReplyFormProps = {
  disabled: boolean;
  errorMessage: string;
  onSubmit: (
    values: TicketMessageFormValues,
    attachments: SelectedAttachment[],
  ) => Promise<boolean>;
};

const initialValues: TicketMessageFormValues = {
  message: "",
};

export function TicketReplyForm({
  disabled,
  errorMessage,
  onSubmit,
}: TicketReplyFormProps) {
  const { showError } = useNotifications();

  const [attachments, setAttachments] = useState<SelectedAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState("");

  // The hook returns a boolean so this reusable form can decide whether to
  // clear the textarea. A failed API request keeps the typed message in place.
  async function handleSubmit(
    values: TicketMessageFormValues,
    helpers: FormikHelpers<TicketMessageFormValues>,
  ) {
    const submitted = await onSubmit(values, attachments);

    if (submitted) {
      setAttachments([]);
      setAttachmentError("");
      helpers.resetForm();
    }
  }

  async function handlePickAttachments() {
    const result = await DocumentPicker.getDocumentAsync({
      // Important for web: the default base64 behavior reads the whole file
      // before returning. Large files would appear to do nothing because the
      // picker is busy reading gigabytes before our size validation can run.
      base64: false,
      copyToCacheDirectory: true,
      multiple: true,
      type: [
        "image/png",
        "image/jpeg",
        "application/pdf",
        "application/zip",
        "application/x-zip-compressed",
      ],
    });

    if (result.canceled) {
      return;
    }

    const pickedAttachments = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      // Expo web can put the size on asset.file instead of asset.size. Store
      // whichever value is available so validation can give immediate feedback.
      size: asset.size ?? asset.file?.size,
      file: asset.file,
    }));

    const knownAttachmentKeys = new Set(
      attachments.map(
        (attachment) =>
          `${attachment.uri}:${attachment.name}:${attachment.size ?? 0}`,
      ),
    );

    const newAttachments = pickedAttachments.filter((attachment) => {
      const key = `${attachment.uri}:${attachment.name}:${attachment.size ?? 0}`;
      return !knownAttachmentKeys.has(key);
    });

    const sizeError = getAttachmentSizeError(newAttachments, attachments);

    if (sizeError) {
      setAttachmentError(sizeError);
      showError("Attachment too large", sizeError);
      return;
    }

    setAttachmentError("");

    // A user can open the picker more than once before pressing send. Append
    // new files instead of replacing the previous selection, but skip the exact
    // same file if the picker returns it again.
    setAttachments((currentAttachments) => [
      ...currentAttachments,
      ...newAttachments,
    ]);
  }

  return (
    // Formik keeps message, touched, errors and isSubmitting together.
    // The validation schema prevents blank replies before the API is called.
    <Formik
      initialValues={initialValues}
      validationSchema={ticketMessageSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        isSubmitting,
        handleBlur,
        handleChange,
        handleSubmit,
        setTouched,
        validateForm,
      }) => (
        <>
          {/* handleChange writes into Formik state; handleBlur marks the field
             as touched so validation errors appear at the right moment. */}
          <FormTextInput
            style={styles.textArea}
            placeholder={
              disabled
                ? "Closed tickets cannot receive replies"
                : "Write a reply"
            }
            placeholderTextColor={colors.muted}
            value={values.message}
            onChangeText={handleChange("message")}
            onBlur={handleBlur("message")}
            error={errors.message}
            touched={touched.message}
            editable={!disabled}
            multiline
            textAlignVertical="top"
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <View style={styles.attachmentActions}>
            <Pressable
              style={[
                styles.secondaryButton,
                disabled && styles.buttonDisabled,
              ]}
              onPress={handlePickAttachments}
              disabled={disabled}
            >
              <Text style={styles.secondaryButtonText}>Add attachments</Text>
            </Pressable>

            {attachments.length > 0 ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setAttachments([]);
                  setAttachmentError("");
                }}
                disabled={disabled}
              >
                <Text style={styles.secondaryButtonText}>Clear files</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.attachmentHelpText}>
            Upload limit: {ATTACHMENT_UPLOAD_LIMIT_LABEL} per reply.
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
                <Text key={attachment.uri} style={styles.attachmentText}>
                  {attachment.name}
                </Text>
              ))}
            </View>
          ) : null}

          {/* Wrapping Formik's handleSubmit prevents the press event from being
             treated as form values by TypeScript. */}
          <Pressable
            style={[
              styles.primaryButton,
              (disabled || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={async () => {
              await submitFormWithValidationToast({
                values,
                validateForm,
                setTouched,
                submitForm: handleSubmit,
                showError,
                toastTitle: "Please check the reply",
              });
            }}
            disabled={disabled || isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Sending..." : "Send reply"}
            </Text>
          </Pressable>
        </>
      )}
    </Formik>
  );
}
