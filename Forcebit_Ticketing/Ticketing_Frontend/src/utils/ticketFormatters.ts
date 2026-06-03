import type { StatusFilter, TicketStatus } from "../types";

// Format a backend ISO date string for compact ticket cards.
export function formatTicketDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

// Detail screens need the time as well as the date for conversation messages.
export function formatTicketDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

// Keep status display text centralized. If labels ever change again, screens
// and filters do not need to duplicate that wording.
const ticketStatusLabels: Record<StatusFilter | TicketStatus, string> = {
  All: "All",
  New: "New",
  Open: "Open",
  Closed: "Closed",
};

export function formatTicketStatus(status: StatusFilter | TicketStatus) {
  return ticketStatusLabels[status];
}
