import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  addTicketMessage,
  getTicketById,
  updateTicketStatus,
} from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";
import { ticketStatuses, TicketDetail, TicketStatus } from "../types";
import { useErrorHandler } from "./useErrorHandler";

export { ticketStatuses };

// Custom hook to manage the state and logic for the ticket detail screen, including loading the ticket details,
// handling replies, updating ticket status, and managing loading and error states
export function useTicketDetailScreen(ticketId: string) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState<TicketStatus | null>(
    null,
  );

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not load this ticket.",
  );

  // Function to load the ticket details by its ID, with error handling and loading state management.
  // This function is called when the screen is focused to ensure the latest ticket data is displayed
  const loadTicket = useCallback(async () => {
    try {
      clearError();
      setIsLoading(true);
      const data = await getTicketById(ticketId);
      setTicket(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError, ticketId]);

  // useFocusEffect is used to call loadTicket whenever the screen comes into focus,
  // ensuring that the ticket details are refreshed and up-to-date whenever the user navigates to this screen
  useFocusEffect(
    useCallback(() => {
      loadTicket();
    }, [loadTicket]),
  );

  // Function to handle sending a reply message to the ticket, including validation to ensure the reply is not empty,
  // error handling, and loading state management.
  async function handleSendReply() {
    if (!reply.trim()) {
      return;
    }

    try {
      clearError();
      setIsSubmitting(true);
      await addTicketMessage(ticketId, { message: reply.trim() });
      setReply("");
      await loadTicket();
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Function to handle updating the ticket status, including error handling and loading state management.
  async function handleUpdateStatus(status: TicketStatus) {
    try {
      clearError();
      setStatusSubmitting(status);
      await updateTicketStatus(ticketId, status);
      await loadTicket();
    } catch (error) {
      handleError(error);
    } finally {
      setStatusSubmitting(null);
    }
  }

  // Determine if the reply button should be disabled based on whether a reply is currently being submitted
  const replyDisabled =
    isSubmitting || !reply.trim() || ticket?.status === "Closed";

  return {
    user,
    ticket,
    reply,
    setReply,
    isLoading,
    isSubmitting,
    statusSubmitting,
    errorMessage,
    replyDisabled,
    handleSendReply,
    handleUpdateStatus,
  };
}
