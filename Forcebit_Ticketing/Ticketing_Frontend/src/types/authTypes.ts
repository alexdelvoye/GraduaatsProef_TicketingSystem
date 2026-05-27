// Login request body sent to /api/auth/login.
export type LoginRequest = {
  email: string;
  password: string;
};

// Register request body sent to /api/auth/register.
export type RegisterRequest = {
  name: string;
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Profile update request. Company and role are deliberately not included
// because users should not edit those fields themselves.
export type UpdateProfileRequest = {
  name: string;
  email: string;
};

// Keep the frontend role names aligned with Domain.Enums.UserRole in the
// backend. A union type catches typos such as "client" at compile time.
export type AuthUserRole = "Client" | "Admin";

// User data stored in AuthContext and used by screens.
export type AuthUser = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  role: AuthUserRole;
};

// Backend auth response after successful login/register.
export type AuthResponse = {
  token: string;
  user: AuthUser;
};
