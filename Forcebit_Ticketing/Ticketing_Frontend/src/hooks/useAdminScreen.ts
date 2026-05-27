import { useCallback, useMemo, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { getAllTickets, getClients } from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";
import { statusFilters } from "../types";

import { useErrorHandler } from "./useErrorHandler";

import type { ClientListItem, StatusFilter, TicketListItem } from "../types";

// Re-export so the screen can import the hook and available filter values from
// one file.
export { statusFilters };

// Display company name first because the admin usually thinks in customers, not
// contact persons. Fall back to name for clients without a company.
export function getClientLabel(client: ClientListItem) {
  return client.companyName || client.name;
}

// Admin screen behavior hook. It owns dashboard data, filters and refresh state
// so the screen component can stay mostly presentational.
export function useAdminScreen() {
  const { signOut } = useAuth();

  // clients are used for the client filter; tickets are the data being filtered.
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [tickets, setTickets] = useState<TicketListItem[]>([]);

  // "All" is a frontend-only filter value. Real ticket statuses come from the
  // backend enum values.
  const [selectedClientId, setSelectedClientId] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not load the admin dashboard.",
  );

  // Load clients and tickets together. Promise.all lets both requests run in
  // parallel, so the dashboard opens faster than waiting for one then the other.
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

  // Refresh on focus so the admin list updates after opening/changing tickets.
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  // Filtering is derived state: do not store it separately, calculate it from
  // tickets and filter choices.
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const clientMatches =
        selectedClientId === "All" || ticket.clientId === selectedClientId;
      const statusMatches =
        selectedStatus === "All" || ticket.status === selectedStatus;

      // A ticket must match both selected filters to appear.
      return clientMatches && statusMatches;
    });
  }, [selectedClientId, selectedStatus, tickets]);

  // Gives the admin quick feedback about remaining active work.
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
