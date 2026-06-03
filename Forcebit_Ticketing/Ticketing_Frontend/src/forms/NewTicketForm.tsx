import { Formik } from "formik";
import { Pressable, Text } from "react-native";

import { AttachmentPicker } from "./AttachmentPicker";
import { FormOptionGroup } from "./FormOptionGroup";
import { FormTextInput } from "./FormTextInput";
import { submitFormWithValidationToast } from "./formErrorHelpers";

import { useNotifications } from "../context/NotificationContext";
import { useAttachmentPicker } from "../hooks/useAttachmentPicker";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { homeStyles as styles } from "../styles/homeStyles";
import { ticketCategories, ticketSubjects } from "../types";
import { createTicketSchema } from "../validation/ticketSchema";

import type { SelectedAttachment } from "../types";
import type { CreateTicketFormValues } from "../validation/ticketSchema";

type NewTicketFormProps = {
  errorMessage: string;
  onSubmit: (
    values: CreateTicketFormValues,
    attachments: SelectedAttachment[],
  ) => Promise<void>;
};

const initialValues: CreateTicketFormValues = {
  title: "",
  category: ticketCategories[0],
  subject: ticketSubjects[0],
  description: "",
};

function formatCategory(category: string) {
  // The enum value is compact for the backend; the label is friendlier for the
  // user. This keeps display text separate from stored values.
  return category === "TechnicalProblem" ? "Technical" : category;
}

export function NewTicketForm({ errorMessage, onSubmit }: NewTicketFormProps) {
  const { showError } = useNotifications();
  const { isCompact, isNarrow } = useResponsiveLayout();
  const {
    attachments,
    attachmentError,
    attachmentUsage,
    pickAttachments,
    clearAttachments,
    removeAttachment,
  } = useAttachmentPicker("per ticket");

  return (
    // Category and subject are enum-like choices, so this form uses option
    // groups instead of free text. That prevents invalid values before submit.
    <Formik
      initialValues={initialValues}
      validationSchema={createTicketSchema}
      onSubmit={(values) => onSubmit(values, attachments)}
    >
      {({
        values,
        errors,
        touched,
        isSubmitting,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        setFieldTouched,
        setTouched,
        validateForm,
      }) => (
        <>
          <Text style={styles.label}>Title</Text>
          <FormTextInput
            placeholder="Short summary"
            value={values.title}
            onChangeText={handleChange("title")}
            onBlur={handleBlur("title")}
            error={errors.title}
            touched={touched.title}
          />

          <Text style={styles.label}>Category</Text>
          <FormOptionGroup
            value={values.category}
            options={ticketCategories}
            getLabel={formatCategory}
            onChange={(value) => {
              // Option buttons do not trigger a normal TextInput blur event, so
              // we mark the field touched manually before changing the value.
              setFieldTouched("category", true);
              setFieldValue("category", value);
            }}
            error={errors.category}
            touched={touched.category}
          />

          <Text style={styles.label}>Subject</Text>
          <FormOptionGroup
            value={values.subject}
            options={ticketSubjects}
            onChange={(value) => {
              // Same pattern as category: set touched for validation display,
              // then store the selected enum-like value.
              setFieldTouched("subject", true);
              setFieldValue("subject", value);
            }}
            error={errors.subject}
            touched={touched.subject}
          />

          <Text style={styles.label}>Description</Text>
          {/* The label stays user-friendly, but the submit hook sends this text
             as initialMessage so it becomes the first conversation message. */}
          <FormTextInput
            style={styles.textArea}
            placeholder="What happened?"
            value={values.description}
            onChangeText={handleChange("description")}
            onBlur={handleBlur("description")}
            error={errors.description}
            touched={touched.description}
            multiline
            textAlignVertical="top"
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <AttachmentPicker
            attachments={attachments}
            attachmentError={attachmentError}
            attachmentUsage={attachmentUsage}
            limitLabel="per ticket"
            onPickAttachments={pickAttachments}
            onClearAttachments={clearAttachments}
            onRemoveAttachment={removeAttachment}
          />

          <Pressable
            style={[
              styles.primaryButton,
              isCompact ? styles.primaryButtonCompact : null,
              isNarrow ? styles.primaryButtonNarrow : null,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={async () => {
              await submitFormWithValidationToast({
                values,
                validateForm,
                setTouched,
                submitForm: () => {
                  handleSubmit();
                },
                showError,
                toastTitle: "Please check the ticket",
              });
            }}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Creating..." : "Create ticket"}
            </Text>
          </Pressable>
        </>
      )}
    </Formik>
  );
}
