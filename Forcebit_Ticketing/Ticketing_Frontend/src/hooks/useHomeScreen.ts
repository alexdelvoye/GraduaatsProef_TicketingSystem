import { useCallback, useMemo, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { getMyTickets } from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";

import { useErrorHandler } from "./useErrorHandler";

import type { TicketGroup, TicketListItem } from "../types";

// These groups describe the visual columns/sections on the home screen.
// Keeping them as data makes the render code simpler and avoids repeating the
// same status/title/description combinations.
const ticketGroups: TicketGroup[] = [
  {
    status: "New",
    title: "New",
    description: "Waiting for a first support reply",
  },
  {
    status: "Open",
    title: "Open",
    description: "Active conversation with Forcebit",
  },
  {
    status: "Closed",
    title: "Closed",
    description: "Resolved tickets",
  },
];

// Convert a flat API response into grouped data that the UI can render.
// The backend returns tickets as a list; grouping is a presentation concern, so
// it belongs in the frontend instead of the API.
function groupTickets(tickets: TicketListItem[]) {
  return ticketGroups.map((group) => ({
    ...group,
    tickets: tickets.filter((ticket) => ticket.status === group.status),
  }));
}

// Home screen behavior hook. The screen component can render from these values
// without needing to know how tickets are fetched or grouped.
export function useHomeScreen() {
  const { user, signOut } = useAuth();

  // The original ticket list is kept because other derived values, such as
  // grouped tickets and active count, can be calculated from this one source.
  const [tickets, setTickets] = useState<TicketListItem[]>([]);

  // Initial loading and pull-to-refresh are separate states because they are
  // shown differently in the UI.
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not load your tickets.",
  );

  // useMemo recalculates only when tickets change. This is not only for
  // performance; it also documents that groupedTickets is derived state.
  const groupedTickets = useMemo(() => groupTickets(tickets), [tickets]);

  // Closed tickets are not counted as active work. New and open conversation
  // tickets both still need attention from either the client or support.
  const activeTicketCount = tickets.filter(
    (ticket) => ticket.status !== "Closed",
  ).length;

  // showRefreshing chooses which loading indicator should appear. The same
  // function can be used for the first load and for pull-to-refresh.
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

  // Reload when the screen receives focus. This is useful after creating a new
  // ticket or after returning from a detail screen where something changed.
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadTickets();
      } else {
        // If there is no user, avoid leaving the page stuck in a loading state.
        setIsLoading(false);
      }
    }, [loadTickets, user]),
  );

  // Expose only what the screen needs. This keeps the screen API intentional.
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
