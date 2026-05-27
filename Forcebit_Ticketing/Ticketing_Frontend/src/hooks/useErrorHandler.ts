import { useCallback, useState } from "react";

import { ApiError } from "../api/apiClient";
import { useNotifications } from "../context/NotificationContext";

// Convert different unknown error shapes into a readable message. The parameter
// is unknown because catch blocks can catch anything in JavaScript.
function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return fallback;
}

// Reusable error hook. It gives screens one inline error string and also shows a
// toast, so error handling is consistent across the app.
export function useErrorHandler(defaultMessage = "Something went wrong.") {
  const { showError } = useNotifications();
  const [errorMessage, setErrorMessage] = useState("");

  const clearError = useCallback(() => {
    // Useful before retrying a request, so old errors do not remain visible.
    setErrorMessage("");
  }, []);

  const handleError = useCallback(
    (error: unknown, fallback = defaultMessage) => {
      const message = getErrorMessage(error, fallback);

      // Keep both levels of feedback:
      // - inline errorMessage near the form/list where the user is working
      // - toast notification for consistent application-wide feedback
      setErrorMessage(message);
      showError("Something went wrong", message);
    },
    [defaultMessage, showError],
  );

  return {
    errorMessage,
    clearError,
    handleError,
  };
}
