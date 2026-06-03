// Frontend version of the backend TicketStatus enum. Literal union types give
// autocomplete and prevent typo values like "In progress".
export type TicketStatus = "New" | "Open" | "Closed";

// These values mirror backend ticket categories.
export type TicketCategory =
  | "Sales"
  | "TechnicalProblem"
  | "Question"
  | "Installation"
  | "Other";

// These values mirror backend ticket subjects.
export type TicketSubject =
  | "Gateway"
  | "Sensors"
  | "Software"
  | "Dashboard"
  | "Connectivity"
  | "Account"
  | "Other";

// "All" exists only in the frontend as a filter choice.
export type StatusFilter = "All" | TicketStatus;

// UI grouping shape used by the home screen.
export type TicketGroup = {
  status: TicketStatus;
  title: string;
  description: string;
};

// Arrays are used by forms/buttons when rendering selectable values.
export const ticketStatuses: TicketStatus[] = ["New", "Open", "Closed"];

// New is creation-only, so status update controls expose only actionable states.
export const ticketStatusUpdateOptions: TicketStatus[] = ["Open", "Closed"];

export const statusFilters: StatusFilter[] = ["All", "New", "Open", "Closed"];

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

// Compact ticket shape for lists. It deliberately excludes heavy detail data
// such as messages.
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

// Message shape returned inside ticket detail responses.
export type TicketAttachment = {
  id: string;
  ticketId: string;
  messageId?: string | null;
  fileName: string;
  fileUrl: string;
  contentType: string;
  uploadedAt: string;
};

export type TicketMessage = {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
  attachments: TicketAttachment[];
};

// Detail extends list item with conversation data. The original create-ticket
// description is represented as the first message, not as a ticket field.
export type TicketDetail = TicketListItem & {
  closedAt?: string | null;
  messages: TicketMessage[];
};

// Request body for creating a ticket. initialMessage is the first message in
// the conversation.
export type CreateTicketRequest = {
  title: string;
  category: TicketCategory;
  subject: TicketSubject;
  initialMessage: string;
};

// Request body for adding a message to an existing ticket.
export type CreateTicketMessageRequest = {
  message: string;
};

// Frontend-only shape for files selected before they are uploaded.
export type SelectedAttachment = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  file?: File;
};

// Admin dashboard client summary.
export type ClientListItem = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  activeTicketCount: number;
  closedTicketCount: number;
};
