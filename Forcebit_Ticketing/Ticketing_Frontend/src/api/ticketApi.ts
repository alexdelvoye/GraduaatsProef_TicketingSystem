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

export function getMyTickets() {
  return apiFetch<TicketListItem[]>("/tickets");
}

export function getAllTickets() {
  return apiFetch<TicketListItem[]>("/admin/tickets");
}

export function getClients() {
  return apiFetch<ClientListItem[]>("/admin/clients");
}

export function getClientTickets(clientId: string) {
  return apiFetch<TicketListItem[]>(`/admin/clients/${clientId}/tickets`);
}

export function getTicketById(ticketId: string) {
  return apiFetch<TicketDetail>(`/tickets/${ticketId}`);
}

export function createTicket(request: CreateTicketRequest) {
  return apiFetch<TicketDetail>("/tickets", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function addTicketMessage(
  ticketId: string,
  request: CreateTicketMessageRequest,
) {
  return apiFetch<TicketMessage>(`/tickets/${ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateTicketStatus(ticketId: string, status: TicketStatus) {
  return apiFetch<void>(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
