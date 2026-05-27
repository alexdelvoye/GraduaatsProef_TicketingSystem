import { apiFetch } from "./apiClient";

import { AuthResponse, LoginRequest, RegisterRequest } from "../types";

// Small API modules keep endpoint paths out of screens/hooks. Hooks call
// login/register without needing to know exact URLs.
export function login(request: LoginRequest) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// Register returns AuthResponse too, so AuthContext can treat registration and
// login the same after the backend succeeds.
export function register(request: RegisterRequest) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
