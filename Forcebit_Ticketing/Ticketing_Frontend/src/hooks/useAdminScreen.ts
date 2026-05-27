import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getAllTickets, getClients } from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";
import {
  ClientListItem,
  statusFilters,
  StatusFilter,
  TicketListItem,
} from "../types";
import { useErrorHandler } from "./useErrorHandler";

//
export { statusFilters };

// Function to get a display label for a client, using the company name if available, or falling back to the client's name
export function getClientLabel(client: ClientListItem) {
  return client.companyName || client.name;
}

// Custom hook to manage the state and logic for the admin screen, including loading clients and tickets, handling filters, and managing loading and error states
export function useAdminScreen() {
  const { signOut } = useAuth();
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not load the admin dashboard.",
  );

  // Function to load the dashboard data, including clients and tickets, with error handling
  // and loading state management. It can show a refreshing indicator if the data is being reloaded while the user is already on the screen
  const loadDashboard = useCallback(
    async (showRefreshing = false) => {
      try {
        clearError();
        if (showRefreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const [clientData, ticketData] = await Promise.all([
          getClients(),
          getAllTickets(),
        ]);

        setClients(clientData);
        setTickets(ticketData);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [clearError, handleError],
  );

  // Load the dashboard data when the screen is focused, ensuring that the latest client
  // and ticket information is displayed whenever the admin navigates to this screen
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  // Memoized value for filtered tickets based on the selected client
  // and status filters, improving performance by avoiding unnecessary recalculations when the filters or ticket data change
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const clientMatches =
        selectedClientId === "All" || ticket.clientId === selectedClientId;
      const statusMatches =
        selectedStatus === "All" || ticket.status === selectedStatus;

      return clientMatches && statusMatches;
    });
  }, [selectedClientId, selectedStatus, tickets]);

  const activeTicketCount = tickets.filter(
    (ticket) => ticket.status !== "Closed",
  ).length;

  return {
    signOut,
    clients,
    selectedClientId,
    setSelectedClientId,
    selectedStatus,
    setSelectedStatus,
    filteredTickets,
    activeTicketCount,
    isLoading,
    isRefreshing,
    errorMessage,
    loadDashboard,
  };
}
