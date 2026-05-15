import { apiFetch } from "./apiClient";

export type TicketStatus = "Open" | "InProgress" | "Closed";

export type TicketListItem = {
  id: string;
  title: string;
  category: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
};

export type TicketDetail = TicketListItem & {
  clientId: string;
  clientName: string;
  companyName: string;
  description: string;
  closedAt?: string | null;
  messages: TicketMessage[];
};

export type CreateTicketRequest = {
  title: string;
  category: string;
  subject: string;
  description: string;
};

export type CreateTicketMessageRequest = {
  message: string;
};

export function getMyTickets() {
  return apiFetch<TicketListItem[]>("/tickets");
}

export function getAllTickets() {
  return apiFetch<TicketListItem[]>("/admin/tickets");
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
