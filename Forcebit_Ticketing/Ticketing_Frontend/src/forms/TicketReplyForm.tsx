import { useState } from "react";

import * as DocumentPicker from "expo-document-picker";
import { Formik, FormikHelpers } from "formik";
import { Pressable, Text, View } from "react-native";

import { FormTextInput } from "./FormTextInput";

import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { SelectedAttachment } from "../types";
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
  const [attachments, setAttachments] = useState<SelectedAttachment[]>([]);

  // The hook returns a boolean so this reusable form can decide whether to
  // clear the textarea. A failed API request keeps the typed message in place.
  async function handleSubmit(
    values: TicketMessageFormValues,
    helpers: FormikHelpers<TicketMessageFormValues>,
  ) {
    const submitted = await onSubmit(values, attachments);

    if (submitted) {
      setAttachments([]);
      helpers.resetForm();
    }
  }

  async function handlePickAttachments() {
    const result = await DocumentPicker.getDocumentAsync({
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
      size: asset.size,
      file: asset.file,
    }));

    // A user can open the picker more than once before pressing send. Append
    // new files instead of replacing the previous selection, but skip the exact
    // same file if the picker returns it again.
    setAttachments((currentAttachments) => {
      const knownAttachmentKeys = new Set(
        currentAttachments.map(
          (attachment) =>
            `${attachment.uri}:${attachment.name}:${attachment.size ?? 0}`,
        ),
      );

      const newAttachments = pickedAttachments.filter((attachment) => {
        const key = `${attachment.uri}:${attachment.name}:${attachment.size ?? 0}`;
        return !knownAttachmentKeys.has(key);
      });

      return [...currentAttachments, ...newAttachments];
    });
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
                onPress={() => setAttachments([])}
                disabled={disabled}
              >
                <Text style={styles.secondaryButtonText}>Clear files</Text>
              </Pressable>
            ) : null}
          </View>

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
            onPress={() => handleSubmit()}
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
