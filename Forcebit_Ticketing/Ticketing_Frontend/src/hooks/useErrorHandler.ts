import { useCallback, useState } from "react";
import { ApiError } from "../api/apiClient";

// Helper function to extract a user-friendly error message from various error types, including ApiError and generic Error objects
function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return fallback;
}

// Custom hook to manage error state and provide a consistent way to handle errors across components
export function useErrorHandler(defaultMessage = "Something went wrong.") {
  const [errorMessage, setErrorMessage] = useState("");

  const clearError = useCallback(() => {
    setErrorMessage("");
  }, []);

  const handleError = useCallback(
    (error: unknown, fallback = defaultMessage) => {
      setErrorMessage(getErrorMessage(error, fallback));
    },
    [defaultMessage],
  );

  return {
    errorMessage,
    clearError,
    handleError,
  };
}
