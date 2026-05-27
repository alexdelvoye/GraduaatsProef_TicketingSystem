import { Formik } from "formik";
import { Pressable, Text } from "react-native";

import { FormTextInput } from "./FormTextInput";

import { registerStyles as styles } from "../styles/registerStyles";
import {
  RegisterFormValues,
  registerSchema,
} from "../validation/registerSchema";

type RegisterFormProps = {
  errorMessage: string;
  onSubmit: (values: RegisterFormValues) => Promise<void>;
};

const initialValues: RegisterFormValues = {
  name: "",
  companyName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm({ errorMessage, onSubmit }: RegisterFormProps) {
  return (
    // The form value type is inferred from the Yup schema, so field names stay
    // synchronized between validation, UI and submit code.
    <Formik
      initialValues={initialValues}
      validationSchema={registerSchema}
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
      }) => (
        <>
          {/* Yup compares confirmPassword with password. Keeping that rule in
             the schema keeps custom password logic out of the screen. */}
          <FormTextInput
            style={styles.input}
            errorInputStyle={styles.inputError}
            errorTextStyle={styles.fieldErrorText}
            placeholder="Full name"
            value={values.name}
            onChangeText={handleChange("name")}
            onBlur={handleBlur("name")}
            error={errors.name}
            touched={touched.name}
          />

          <FormTextInput
            style={styles.input}
            errorInputStyle={styles.inputError}
            errorTextStyle={styles.fieldErrorText}
            placeholder="Company name"
            value={values.companyName}
            onChangeText={handleChange("companyName")}
            onBlur={handleBlur("companyName")}
            error={errors.companyName}
            touched={touched.companyName}
          />

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

          <FormTextInput
            style={styles.input}
            errorInputStyle={styles.inputError}
            errorTextStyle={styles.fieldErrorText}
            placeholder="Confirm password"
            value={values.confirmPassword}
            onChangeText={handleChange("confirmPassword")}
            onBlur={handleBlur("confirmPassword")}
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
            secureTextEntry
          />

          {errorMessage ? (
            // Server-side registration errors, such as duplicate email, are
            // displayed separately from field-level Yup validation errors.
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={() => handleSubmit()}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Creating account..." : "Register"}
            </Text>
          </Pressable>
        </>
      )}
    </Formik>
  );
}
