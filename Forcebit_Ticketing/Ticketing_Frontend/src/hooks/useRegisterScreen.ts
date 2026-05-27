import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { registerSchema } from "../validation/registerSchema";
import { useErrorHandler } from "./useErrorHandler";

// Custom hook to manage the state and logic for the registration screen, including form fields for name, company name, email, password, and confirm password,
export function useRegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Registration failed.",
  );

  // Function to handle the registration process when the user submits the form, including validation of form fields using registerSchema, error handling, and loading state management
  async function handleRegister() {
    try {
      clearError();
      setIsSubmitting(true);

      // Validate the form values using the registerSchema, which checks for required fields, email format, password strength,
      // and matching passwords. If validation fails, an error will be thrown and caught in the catch block
      const formValues = await registerSchema.validate(
        {
          name,
          companyName,
          email,
          password,
          confirmPassword,
        },
        { abortEarly: true },
      );

      // Call the signUp function from the AuthContext to register the new user with the provided form values,
      await signUp({
        ...formValues,
        email: formValues.email.toLowerCase(),
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    name,
    setName,
    companyName,
    setCompanyName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    errorMessage,
    handleRegister,
  };
}
