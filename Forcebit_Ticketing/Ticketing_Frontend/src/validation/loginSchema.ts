import * as yup from "yup";

// Yup schemas define the client-side validation rules used by Formik.
// The backend still validates too; frontend validation is for fast feedback and
// backend validation is the real safety net.
export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email is required."),
  password: yup.string().required("Password is required."),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
