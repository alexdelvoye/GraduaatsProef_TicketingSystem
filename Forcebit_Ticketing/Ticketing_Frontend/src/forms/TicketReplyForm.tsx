import { Formik } from "formik";
import { Pressable, Text } from "react-native";

import type { FormikHelpers } from "formik";

import { AttachmentPicker } from "./AttachmentPicker";
import { FormTextInput } from "./FormTextInput";
import { submitFormWithValidationToast } from "./formErrorHelpers";

import { useNotifications } from "../context/NotificationContext";
import { useAttachmentPicker } from "../hooks/useAttachmentPicker";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { ticketMessageSchema } from "../validation/ticketSchema";

import type { SelectedAttachment } from "../types";
import type { TicketMessageFormValues } from "../validation/ticketSchema";

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
  const { attachments, attachmentError, pickAttachments, clearAttachments } =
    useAttachmentPicker("per reply");

  // The hook returns a boolean so this reusable form can decide whether to
  // clear the textarea. A failed API request keeps the typed message in place.
  async function handleSubmit(
    values: TicketMessageFormValues,
    helpers: FormikHelpers<TicketMessageFormValues>,
  ) {
    const submitted = await onSubmit(values, attachments);

    if (submitted) {
      clearAttachments();
      helpers.resetForm();
    }
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

          <AttachmentPicker
            attachments={attachments}
            attachmentError={attachmentError}
            disabled={disabled}
            limitLabel="per reply"
            onPickAttachments={pickAttachments}
            onClearAttachments={clearAttachments}
          />

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
