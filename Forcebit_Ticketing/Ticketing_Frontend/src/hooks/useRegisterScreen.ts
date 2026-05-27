import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import { useErrorHandler } from "./useErrorHandler";

import type { RegisterFormValues } from "../validation/registerSchema";

// Screen hook for registration behavior. The RegisterForm handles field state
// and Yup validation; this hook calls AuthContext and shows feedback.
export function useRegisterScreen() {
  const { signUp } = useAuth();
  const { showSuccess } = useNotifications();

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Registration failed.",
  );

  async function handleRegister(values: RegisterFormValues) {
    try {
      clearError();

      // Trim user-entered text before sending it to the backend. This prevents
      // accidental spaces becoming part of names or emails.
      await signUp({
        ...values,
        name: values.name.trim(),
        companyName: values.companyName.trim(),
        email: values.email.trim().toLowerCase(),
      });

      showSuccess(
        "Account created",
        "You are signed in and ready to create tickets.",
      );
    } catch (error) {
      handleError(error);
    }
  }

  return {
    errorMessage,
    handleRegister,
  };
}
