export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthUser = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
