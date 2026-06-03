import { useCallback, useMemo, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { getMyTickets } from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";
import {
  countTicketsByStatus,
  ticketMatchesSearch,
} from "../utils/ticketListHelpers";
import {
  clientTicketGroups,
  groupTicketsByStatus,
} from "../utils/ticketGroups";

import { useErrorHandler } from "./useErrorHandler";

import type { CategoryFilter, StatusFilter, TicketListItem } from "../types";

// Home screen behavior hook. The screen component can render from these values
// without needing to know how tickets are fetched or grouped.
export function useHomeScreen() {
  const { user, signOut } = useAuth();

  // The original ticket list is kept because grouped tickets, search results,
  // and status counts can all be calculated from this one source.
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [ticketSearchText, setTicketSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("All");

  // Initial loading and pull-to-refresh are separate states because they are
  // shown differently in the UI.
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not load your tickets.",
  );

  // Client overview follows one derived-state pipeline: raw tickets -> enabled
  // search/filter choices -> workflow groups -> paginated sections.
  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const statusMatches =
          selectedStatus === "All" || ticket.status === selectedStatus;
        const categoryMatches =
          selectedCategory === "All" || ticket.category === selectedCategory;

        return (
          statusMatches &&
          categoryMatches &&
          ticketMatchesSearch(ticket, ticketSearchText)
        );
      }),
    [selectedCategory, selectedStatus, ticketSearchText, tickets],
  );

  // useMemo recalculates only when filtered tickets change. This is not only
  // for performance; it also documents that groupedTickets is derived state.
  const groupedTickets = useMemo(
    () =>
      groupTicketsByStatus(filteredTickets, selectedStatus, clientTicketGroups),
    [filteredTickets, selectedStatus],
  );

  const ticketCounts = useMemo(() => countTicketsByStatus(tickets), [tickets]);

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
    ticketCounts,
    ticketSearchText,
    setTicketSearchText,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    isRefreshing,
    errorMessage,
    loadTickets,
  };
}
