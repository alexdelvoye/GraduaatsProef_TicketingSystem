import { apiFetch } from "./apiClient";

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

export function login(request: LoginRequest) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function register(request: RegisterRequest) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
  });
}