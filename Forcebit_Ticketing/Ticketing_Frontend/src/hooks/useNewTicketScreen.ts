import { useState } from "react";
import { createTicket } from "../api/ticketApi";
import { ticketCategories, ticketSubjects } from "../types";
import { useErrorHandler } from "./useErrorHandler";

export { ticketCategories, ticketSubjects };

// useNewTicketScreen is a custom hook that manages the state and logic for creating a new ticket,
// including form fields for title, category, subject, and description, as well as handling the submission process with error handling and loading state management
export function useNewTicketScreen(onCreated: () => void) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(ticketCategories[0]);
  const [subject, setSubject] = useState(ticketSubjects[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not create the ticket.",
  );

  // Function to handle the creation of a new ticket when the user submits the form,
  // including validation to ensure required fields are filled, error handling, and loading state management
  async function handleCreateTicket() {
    if (!title.trim() || !description.trim()) {
      return;
    }

    try {
      clearError();
      setIsSubmitting(true);

      await createTicket({
        title: title.trim(),
        category,
        subject,
        description: description.trim(),
      });

      onCreated();
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || !title.trim() || !description.trim();

  return {
    title,
    setTitle,
    category,
    setCategory,
    subject,
    setSubject,
    description,
    setDescription,
    isSubmitting,
    isDisabled,
    errorMessage,
    handleCreateTicket,
  };
}
