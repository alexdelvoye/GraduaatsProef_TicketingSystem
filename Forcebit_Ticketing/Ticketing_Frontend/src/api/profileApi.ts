import { apiFetch } from "./apiClient";

import type { AuthUser, UpdateProfileRequest } from "../types";

// Authenticated endpoint for editing only the current user's own profile.
export function updateProfile(request: UpdateProfileRequest) {
  return apiFetch<AuthUser>("/profile", {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

// Deletes the currently authenticated client account. The backend decides from
// the JWT which account is being removed, so no user id is sent from the app.
export function deleteProfile() {
  return apiFetch<void>("/profile", {
    method: "DELETE",
  });
}
