import { apiFetch } from "./apiClient";

import {
  ClientListItem,
  CreateTicketMessageRequest,
  CreateTicketRequest,
  TicketDetail,
  TicketListItem,
  TicketMessage,
  TicketStatus,
} from "../types";

// Client endpoint: returns only the authenticated client's tickets.
export function getMyTickets() {
  return apiFetch<TicketListItem[]>("/tickets");
}

// Admin endpoint: returns every ticket for the queue overview.
export function getAllTickets() {
  return apiFetch<TicketListItem[]>("/admin/tickets");
}

// Admin endpoint: client summaries for filtering and dashboard counts.
export function getClients() {
  return apiFetch<ClientListItem[]>("/admin/clients");
}

// Admin endpoint: tickets for one selected client.
export function getClientTickets(clientId: string) {
  return apiFetch<TicketListItem[]>(`/admin/clients/${clientId}/tickets`);
}

// Shared endpoint: service rules decide whether the current user may view it.
export function getTicketById(ticketId: string) {
  return apiFetch<TicketDetail>(`/tickets/${ticketId}`);
}

// Client endpoint for creating a new support ticket.
export function createTicket(request: CreateTicketRequest) {
  return apiFetch<TicketDetail>("/tickets", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// Shared endpoint for adding a conversation message to a ticket.
export function addTicketMessage(
  ticketId: string,
  request: CreateTicketMessageRequest,
) {
  return apiFetch<TicketMessage>(`/tickets/${ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// Admin endpoint for changing ticket workflow state.
export function updateTicketStatus(ticketId: string, status: TicketStatus) {
  return apiFetch<void>(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
