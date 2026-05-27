import * as yup from "yup";
import {
  ticketCategories,
  ticketSubjects,
  TicketCategory,
  TicketSubject,
} from "../types";

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
    .max(4000, "Description must be 4000 characters or less.")
    // The form still says description for the client, but this value is sent as
    // initialMessage and stored as the first conversation message.
    .required("Description is required."),
});

export const ticketMessageSchema = yup.object({
  message: yup
    .string()
    .trim()
    .max(4000, "Reply must be 4000 characters or less.")
    .required("Reply is required."),
});

export type CreateTicketFormValues = yup.InferType<typeof createTicketSchema>;
export type TicketMessageFormValues = yup.InferType<typeof ticketMessageSchema>;
