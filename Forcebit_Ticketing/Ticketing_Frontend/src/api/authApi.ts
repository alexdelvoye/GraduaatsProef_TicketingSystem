import { apiFetch } from "./apiClient";
import { AuthResponse, LoginRequest, RegisterRequest } from "../types";

// API function to perform user login by sending credentials to the backend and receiving an authentication token
export function login(request: LoginRequest) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// API function to perform user registration by sending user details to the backend and receiving an authentication token
export function register(request: RegisterRequest) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
