import { apiFetch } from "./apiClient";

import { appendAttachmentToFormData } from "../utils/attachmentFormData";

import type {
  ClientListItem,
  CreateTicketMessageRequest,
  CreateTicketRequest,
  TicketDetail,
  TicketListItem,
  TicketMessage,
  SelectedAttachment,
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

// Multipart version of ticket creation. The description still becomes the
// first message, and these files are attached to that first message.
export async function createTicketWithAttachments(
  request: CreateTicketRequest,
  attachments: SelectedAttachment[],
) {
  const formData = new FormData();

  formData.append("title", request.title);
  formData.append("category", request.category);
  formData.append("subject", request.subject);
  formData.append("initialMessage", request.initialMessage);

  for (const attachment of attachments) {
    await appendAttachmentToFormData(formData, attachment);
  }

  return apiFetch<TicketDetail>("/tickets/with-attachments", {
    method: "POST",
    body: formData,
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

// Multipart endpoint for replies that include one or more files.
export async function addTicketMessageWithAttachments(
  ticketId: string,
  message: string,
  attachments: SelectedAttachment[],
) {
  const formData = new FormData();

  formData.append("message", message);

  for (const attachment of attachments) {
    await appendAttachmentToFormData(formData, attachment);
  }

  return apiFetch<TicketMessage>(
    `/tickets/${ticketId}/messages/with-attachments`,
    {
      method: "POST",
      body: formData,
    },
  );
}

// Admin endpoint for changing ticket workflow state.
export function updateTicketStatus(ticketId: string, status: TicketStatus) {
  return apiFetch<void>(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
