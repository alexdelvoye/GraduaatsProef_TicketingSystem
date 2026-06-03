import { useCallback, useMemo, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { getAllTickets, getClients } from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";
import { categoryFilters, statusFilters, subjectFilters } from "../types";
import {
  clientMatchesSearch,
  countTicketsByStatus,
  ticketMatchesSearch,
} from "../utils/ticketListHelpers";
import { adminTicketGroups, groupTicketsByStatus } from "../utils/ticketGroups";

import { useErrorHandler } from "./useErrorHandler";

import type {
  CategoryFilter,
  ClientListItem,
  StatusFilter,
  SubjectFilter,
  TicketListItem,
} from "../types";
import type { TicketStatusCounts } from "../utils/ticketListHelpers";

export type ClientDashboardItem = ClientListItem & TicketStatusCounts;

// Re-export so the screen can import the hook and available filter values from
// one file.
export { categoryFilters, statusFilters, subjectFilters };

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
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("All");
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>("All");
  const [clientSearchText, setClientSearchText] = useState("");
  const [ticketSearchText, setTicketSearchText] = useState("");

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

  // The clients endpoint already returns counts, but this page also owns the
  // full ticket list. Recalculating from tickets keeps the client rows and the
  // visible ticket queue based on the same refreshed source of truth.
  const clientsWithTicketCounts = useMemo<ClientDashboardItem[]>(
    () =>
      clients.map((client) => ({
        ...client,
        ...countTicketsByStatus(
          tickets.filter((ticket) => ticket.clientId === client.id),
        ),
      })),
    [clients, tickets],
  );

  const filteredClients = useMemo(
    () =>
      clientsWithTicketCounts.filter((client) =>
        clientMatchesSearch(client, clientSearchText),
      ),
    [clientSearchText, clientsWithTicketCounts],
  );

  // Filtering is derived state: do not store it separately, calculate it from
  // tickets, search text, and filter choices.
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const clientMatches =
        selectedClientId === "All" || ticket.clientId === selectedClientId;
      const statusMatches =
        selectedStatus === "All" || ticket.status === selectedStatus;
      const categoryMatches =
        selectedCategory === "All" || ticket.category === selectedCategory;
      const subjectMatches =
        selectedSubject === "All" || ticket.subject === selectedSubject;
      const searchMatches = ticketMatchesSearch(ticket, ticketSearchText);

      // A ticket must match every enabled filter to appear.
      return (
        clientMatches &&
        statusMatches &&
        categoryMatches &&
        subjectMatches &&
        searchMatches
      );
    });
  }, [
    selectedCategory,
    selectedClientId,
    selectedStatus,
    selectedSubject,
    ticketSearchText,
    tickets,
  ]);

  const ticketCounts = useMemo(() => countTicketsByStatus(tickets), [tickets]);
  // The screen renders grouped workflow sections. TicketGroupSection owns the
  // page state inside each visible New/Open/Closed section.
  const groupedTickets = useMemo(
    () =>
      groupTicketsByStatus(filteredTickets, selectedStatus, adminTicketGroups),
    [filteredTickets, selectedStatus],
  );

  return {
    signOut,
    clients,
    filteredClients,
    selectedClientId,
    setSelectedClientId,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    selectedSubject,
    setSelectedSubject,
    clientSearchText,
    setClientSearchText,
    ticketSearchText,
    setTicketSearchText,
    filteredTickets,
    groupedTickets,
    ticketCounts,
    isLoading,
    isRefreshing,
    errorMessage,
    loadDashboard,
  };
}
