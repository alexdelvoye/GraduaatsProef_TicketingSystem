import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { LoginFormValues } from "../validation/loginSchema";

import { useErrorHandler } from "./useErrorHandler";

// Screen hook for login behavior. The form component owns validation and input
// state; this hook owns what happens after the form submits.
export function useLoginScreen() {
  const { signIn } = useAuth();
  const { showSuccess } = useNotifications();

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Invalid email or password.",
  );

  async function handleLogin(values: LoginFormValues) {
    try {
      clearError();

      // Normalize email the same way the backend does before sending it.
      await signIn({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      showSuccess("Signed in", "Welcome back.");
    } catch (error) {
      handleError(error);
    }
  }

  return {
    errorMessage,
    handleLogin,
  };
}
