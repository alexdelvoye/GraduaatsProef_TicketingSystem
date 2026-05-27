export type TicketStatus = "Open" | "InProgress" | "Closed";

export type TicketCategory =
  | "Sales"
  | "TechnicalProblem"
  | "Question"
  | "Installation"
  | "Other";

export type TicketSubject =
  | "Gateway"
  | "Sensors"
  | "Software"
  | "Dashboard"
  | "Connectivity"
  | "Account"
  | "Other";

export type StatusFilter = "All" | TicketStatus;

export type TicketGroup = {
  status: TicketStatus;
  title: string;
  description: string;
};

export const ticketStatuses: TicketStatus[] = ["Open", "InProgress", "Closed"];

export const statusFilters: StatusFilter[] = [
  "All",
  "Open",
  "InProgress",
  "Closed",
];

export const ticketCategories: TicketCategory[] = [
  "Sales",
  "TechnicalProblem",
  "Question",
  "Installation",
  "Other",
];

export const ticketSubjects: TicketSubject[] = [
  "Gateway",
  "Sensors",
  "Software",
  "Dashboard",
  "Connectivity",
  "Account",
  "Other",
];

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
  category: TicketCategory;
  subject: TicketSubject;
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
