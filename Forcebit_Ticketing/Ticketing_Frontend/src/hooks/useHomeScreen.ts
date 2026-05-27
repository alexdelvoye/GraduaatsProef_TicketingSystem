import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getMyTickets } from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";
import { TicketGroup, TicketListItem } from "../types";
import { useErrorHandler } from "./useErrorHandler";

// Predefined groups for categorizing tickets on the home screen based on their status, including titles and descriptions for each group
const ticketGroups: TicketGroup[] = [
  {
    status: "Open",
    title: "Open",
    description: "Waiting for a first response",
  },
  {
    status: "InProgress",
    title: "In Progress",
    description: "Being handled by Forcebit",
  },
  {
    status: "Closed",
    title: "Closed",
    description: "Resolved tickets",
  },
];

// Function to group tickets by their status for display on the home screen, matching each ticket to the appropriate group defined in ticketGroups
function groupTickets(tickets: TicketListItem[]) {
  return ticketGroups.map((group) => ({
    ...group,
    tickets: tickets.filter((ticket) => ticket.status === group.status),
  }));
}

// Custom hook to manage the state and logic for the home screen, including loading the user's tickets, grouping them by status, and handling loading and error states
export function useHomeScreen() {
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not load your tickets.",
  );

  // Memoized value for grouped tickets based on their status, improving performance by avoiding unnecessary recalculations when the ticket data changes
  const groupedTickets = useMemo(() => groupTickets(tickets), [tickets]);
  const activeTicketCount = tickets.filter(
    (ticket) => ticket.status !== "Closed",
  ).length;

  // Function to load the user's tickets with error handling and loading state management.
  // It can show a refreshing indicator if the data is being reloaded while the user is already on the screen
  const loadTickets = useCallback(
    async (showRefreshing = false) => {
      try {
        clearError();
        if (showRefreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        const data = await getMyTickets();
        setTickets(data);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [clearError, handleError],
  );

  // Load the user's tickets when the screen is focused,
  // ensuring that the latest ticket information is displayed whenever the user navigates to this screen
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadTickets();
      } else {
        setIsLoading(false);
      }
    }, [loadTickets, user]),
  );

  return {
    user,
    signOut,
    groupedTickets,
    activeTicketCount,
    isLoading,
    isRefreshing,
    errorMessage,
    loadTickets,
  };
}
