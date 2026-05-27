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

// User data stored in AuthContext and used by screens.
export type AuthUser = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  role: string;
};

// Backend auth response after successful login/register.
export type AuthResponse = {
  token: string;
  user: AuthUser;
};
