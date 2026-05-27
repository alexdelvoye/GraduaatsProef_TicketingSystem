import { Formik } from "formik";
import { Pressable, Text, View } from "react-native";

import { FormTextInput } from "./FormTextInput";
import { submitFormWithValidationToast } from "./formErrorHelpers";

import { useNotifications } from "../context/NotificationContext";
import { homeStyles as styles } from "../styles/homeStyles";
import { AuthUser } from "../types";
import { ProfileFormValues, profileSchema } from "../validation/profileSchema";

type ProfileFormProps = {
  user: AuthUser;
  errorMessage: string;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
};

export function ProfileForm({
  user,
  errorMessage,
  onSubmit,
}: ProfileFormProps) {
  const { showError } = useNotifications();

  const initialValues: ProfileFormValues = {
    name: user.name,
    email: user.email,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={profileSchema}
      onSubmit={onSubmit}
      enableReinitialize
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
          <Text style={styles.label}>Name</Text>
          <FormTextInput
            placeholder="Full name"
            value={values.name}
            onChangeText={handleChange("name")}
            onBlur={handleBlur("name")}
            error={errors.name}
            touched={touched.name}
          />

          <Text style={styles.label}>Email</Text>
          <FormTextInput
            placeholder="Email"
            value={values.email}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            error={errors.email}
            touched={touched.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <View style={styles.profileFormActions}>
            <Pressable
              style={[
                styles.primaryButton,
                styles.profileSaveButton,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={async () => {
                await submitFormWithValidationToast({
                  values,
                  validateForm,
                  setTouched,
                  submitForm: handleSubmit,
                  showError,
                  toastTitle: "Please check your profile",
                });
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Saving..." : "Save profile"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </Formik>
  );
}
