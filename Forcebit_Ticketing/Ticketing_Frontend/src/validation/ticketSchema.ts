import * as yup from "yup";

import { ticketCategories, ticketSubjects } from "../types";

import type { TicketCategory, TicketSubject } from "../types";

// Must match the backend DTOs and the TicketMessages.Message database column.
// Keeping one frontend constant avoids different forms drifting apart again.
const ticketMessageMaxLength = 3000;

// Ticket form schemas keep form validation separate from screen components.
// This makes screens easier to read and keeps all ticket input rules together.
export const createTicketSchema = yup.object({
  title: yup
    .string()
    .trim()
    .max(200, "Title must be 200 characters or less.")
    .required("Title is required."),
  category: yup
    .mixed<TicketCategory>()
    .oneOf(ticketCategories, "Choose a valid category.")
    .required("Category is required."),
  subject: yup
    .mixed<TicketSubject>()
    .oneOf(ticketSubjects, "Choose a valid subject.")
    .required("Subject is required."),
  description: yup
    .string()
    .trim()
    .max(
      ticketMessageMaxLength,
      `Description must be ${ticketMessageMaxLength} characters or less.`,
    )
    // The form still says description for the client, but this value is sent as
    // initialMessage and stored as the first conversation message.
    .required("Description is required."),
});

export const ticketMessageSchema = yup.object({
  message: yup
    .string()
    .trim()
    .max(
      ticketMessageMaxLength,
      `Reply must be ${ticketMessageMaxLength} characters or less.`,
    )
    .required("Reply is required."),
});

export type CreateTicketFormValues = yup.InferType<typeof createTicketSchema>;
export type TicketMessageFormValues = yup.InferType<typeof ticketMessageSchema>;
