export type TicketStatus = "Open" | "InProgress" | "Closed";

export type TicketListItem = {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
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

export type ClientListItem = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  openTicketCount: number;
  closedTicketCount: number;
};
