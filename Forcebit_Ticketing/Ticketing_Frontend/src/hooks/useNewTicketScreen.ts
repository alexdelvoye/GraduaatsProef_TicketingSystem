import { createTicket } from "../api/ticketApi";
import { useNotifications } from "../context/NotificationContext";
import { CreateTicketFormValues } from "../validation/ticketSchema";

import { useErrorHandler } from "./useErrorHandler";

// Screen hook for creating tickets. The screen passes onCreated so navigation
// stays outside this hook and the hook remains reusable/testable.
export function useNewTicketScreen(onCreated: () => void) {
  const { showSuccess } = useNotifications();

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not create the ticket.",
  );

  async function handleCreateTicket(values: CreateTicketFormValues) {
    try {
      clearError();

      // Yup guarantees required fields before this point. The description field
      // from the form becomes the initial ticket message in the backend.
      await createTicket({
        title: values.title.trim(),
        category: values.category,
        subject: values.subject,
        initialMessage: values.description.trim(),
      });

      showSuccess("Ticket created", "Forcebit can now review your request.");

      // Usually this navigates back to the home screen after successful create.
      onCreated();
    } catch (error) {
      handleError(error);
    }
  }

  return {
    errorMessage,
    handleCreateTicket,
  };
}
