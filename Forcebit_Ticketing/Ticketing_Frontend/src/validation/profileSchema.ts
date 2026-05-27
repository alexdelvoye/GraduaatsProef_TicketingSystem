import * as yup from "yup";

export const profileSchema = yup.object({
  name: yup.string().trim().required("Name is required."),
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email is required."),
});

export type ProfileFormValues = yup.InferType<typeof profileSchema>;
