import { apiFetch } from "./apiClient";
import { AuthResponse, LoginRequest, RegisterRequest } from "../types";

export function login(request: LoginRequest) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function register(request: RegisterRequest) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
