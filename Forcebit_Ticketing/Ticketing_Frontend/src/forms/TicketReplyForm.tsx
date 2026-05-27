import { Formik, FormikHelpers } from "formik";
import { Pressable, Text } from "react-native";

import { FormTextInput } from "./FormTextInput";

import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import {
  TicketMessageFormValues,
  ticketMessageSchema,
} from "../validation/ticketSchema";

type TicketReplyFormProps = {
  disabled: boolean;
  errorMessage: string;
  onSubmit: (values: TicketMessageFormValues) => Promise<boolean>;
};

const initialValues: TicketMessageFormValues = {
  message: "",
};

export function TicketReplyForm({
  disabled,
  errorMessage,
  onSubmit,
}: TicketReplyFormProps) {
  // The hook returns a boolean so this reusable form can decide whether to
  // clear the textarea. A failed API request keeps the typed message in place.
  async function handleSubmit(
    values: TicketMessageFormValues,
    helpers: FormikHelpers<TicketMessageFormValues>,
  ) {
    const submitted = await onSubmit(values);

    if (submitted) {
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
