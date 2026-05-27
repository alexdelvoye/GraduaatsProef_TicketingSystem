import { Formik } from "formik";
import { Pressable, Text } from "react-native";

import { FormTextInput } from "./FormTextInput";
import { submitFormWithValidationToast } from "./formErrorHelpers";

import { useNotifications } from "../context/NotificationContext";
import { loginStyles as styles } from "../styles/loginStyles";
import { loginSchema } from "../validation/loginSchema";

import type { LoginFormValues } from "../validation/loginSchema";

type LoginFormProps = {
  errorMessage: string;
  onSubmit: (values: LoginFormValues) => Promise<void>;
};

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm({ errorMessage, onSubmit }: LoginFormProps) {
  const { showError } = useNotifications();

  return (
    // Formik owns values/touched/errors/isSubmitting.
    // Yup owns validation. The screen only passes the submit action.
    <Formik
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={onSubmit}
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
          {/* handleChange and handleBlur update Formik state directly, so this
             form does not need separate useState variables for every input. */}
          <FormTextInput
            style={styles.input}
            errorInputStyle={styles.inputError}
            errorTextStyle={styles.fieldErrorText}
            placeholder="Email"
            value={values.email}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            error={errors.email}
            touched={touched.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <FormTextInput
            style={styles.input}
            errorInputStyle={styles.inputError}
            errorTextStyle={styles.fieldErrorText}
            placeholder="Password"
            value={values.password}
            onChangeText={handleChange("password")}
            onBlur={handleBlur("password")}
            error={errors.password}
            touched={touched.password}
            secureTextEntry
          />

          {errorMessage ? (
            // This is an API-level error, for example wrong credentials. Field
            // validation errors are shown by FormTextInput.
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Formik keeps isSubmitting true while onSubmit is running, which
             helps prevent double login attempts. */}
          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={async () => {
              await submitFormWithValidationToast({
                values,
                validateForm,
                setTouched,
                submitForm: handleSubmit,
                showError,
                toastTitle: "Please check the form",
              });
            }}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Text>
          </Pressable>
        </>
      )}
    </Formik>
  );
}
