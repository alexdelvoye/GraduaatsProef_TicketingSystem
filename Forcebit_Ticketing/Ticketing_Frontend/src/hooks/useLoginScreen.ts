import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useErrorHandler } from "./useErrorHandler";

export function useLoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Invalid email or password.",
  );

  // Function to handle the login process when the user submits their credentials, including error handling and loading state management
  async function handleLogin() {
    try {
      clearError();
      setIsSubmitting(true);

      await signIn({
        email,
        password,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    errorMessage,
    handleLogin,
  };
}
