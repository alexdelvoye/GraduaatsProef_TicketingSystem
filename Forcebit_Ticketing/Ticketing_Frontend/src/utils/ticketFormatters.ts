import { StatusFilter, TicketStatus } from "../types";

// Function to format ticket dates for display, showing month, day, and year
export function formatTicketDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

// Function to format ticket dates and times for display, showing month, day, year, hour, and minute
export function formatTicketDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const ticketStatusLabels: Record<StatusFilter | TicketStatus, string> = {
  All: "All",
  Open: "Open",
  InProgress: "In Progress",
  Closed: "Closed",
};

// Function to get a display label for a ticket status, converting API values to user-facing labels.
export function formatTicketStatus(status: StatusFilter | TicketStatus) {
  return ticketStatusLabels[status];
}
