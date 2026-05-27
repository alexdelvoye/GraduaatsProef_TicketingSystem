import * as yup from "yup";

// Registration validation mirrors the backend DTO validation.
// Keeping these rules aligned prevents the frontend from accepting data the API
// would reject anyway.
export const registerSchema = yup.object({
  name: yup.string().trim().required("Full name is required."),
  companyName: yup.string().trim().required("Company name is required."),
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email is required."),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters.")
    .required("Password is required."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match.")
    .required("Confirm your password."),
});

export type RegisterFormValues = yup.InferType<typeof registerSchema>;
