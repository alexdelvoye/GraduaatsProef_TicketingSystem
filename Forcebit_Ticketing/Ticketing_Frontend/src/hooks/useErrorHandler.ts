import { useCallback, useState } from "react";
import { ApiError } from "../api/apiClient";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function useErrorHandler(defaultMessage = "Something went wrong.") {
  const [errorMessage, setErrorMessage] = useState("");

  const clearError = useCallback(() => {
    setErrorMessage("");
  }, []);

  const handleError = useCallback(
    (error: unknown, fallback = defaultMessage) => {
      setErrorMessage(getErrorMessage(error, fallback));
    },
    [defaultMessage]
  );

  return {
    errorMessage,
    clearError,
    handleError,
  };
}
