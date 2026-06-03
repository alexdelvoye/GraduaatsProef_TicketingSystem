import type { ClientListItem, TicketListItem } from "../types";

export type TicketStatusCounts = {
  newTicketCount: number;
  openTicketCount: number;
  closedTicketCount: number;
  totalTicketCount: number;
};

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

function fieldMatchesSearch(value: string | undefined, searchText: string) {
  return value?.toLowerCase().includes(searchText) ?? false;
}

// Counts are derived from the same TicketListItem shape used by both
// dashboards, which keeps the admin and client summaries aligned.
export function countTicketsByStatus(
  tickets: TicketListItem[],
): TicketStatusCounts {
  return {
    newTicketCount: tickets.filter((ticket) => ticket.status === "New").length,
    openTicketCount: tickets.filter((ticket) => ticket.status === "Open")
      .length,
    closedTicketCount: tickets.filter((ticket) => ticket.status === "Closed")
      .length,
    totalTicketCount: tickets.length,
  };
}

export function clientMatchesSearch(
  client: ClientListItem,
  searchQuery: string,
) {
  const searchText = normalizeSearchText(searchQuery);

  if (!searchText) {
    return true;
  }

  return (
    fieldMatchesSearch(client.companyName, searchText) ||
    fieldMatchesSearch(client.name, searchText) ||
    fieldMatchesSearch(client.email, searchText)
  );
}

export function ticketMatchesSearch(
  ticket: TicketListItem,
  searchQuery: string,
) {
  const searchText = normalizeSearchText(searchQuery);

  if (!searchText) {
    return true;
  }

  // Admins often search by customer name; clients usually search by title.
  // Including category and subject makes the same search useful on both pages.
  return (
    fieldMatchesSearch(ticket.title, searchText) ||
    fieldMatchesSearch(ticket.companyName, searchText) ||
    fieldMatchesSearch(ticket.clientName, searchText) ||
    fieldMatchesSearch(ticket.category, searchText) ||
    fieldMatchesSearch(ticket.subject, searchText)
  );
}
