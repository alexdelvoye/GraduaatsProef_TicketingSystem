import { getAuthItem } from "../storage/authStorage";

const API_URL = "http://localhost:5047/api";

// Type definition for the expected structure of error responses from the backend
type BackendErrorResponse = {
  statusCode?: number;
  message?: string;
  details?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

// Custom error class to represent API errors with additional context
export class ApiError extends Error {
  statusCode?: number;
  details?: string;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode?: number,
    details?: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.errors = errors;
  }
}

// Checks if the response has a JSON content type
function isJsonResponse(response: Response) {
  return response.headers.get("content-type")?.includes("application/json");
}

// Reads the response body and returns it as JSON if possible, otherwise as text. Handles 204 No Content responses gracefully.
async function readResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  if (isJsonResponse(response)) {
    return (await response.json()) as BackendErrorResponse;
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

// Extracts a user-friendly error message from the backend response
function getBackendErrorMessage(data: BackendErrorResponse | null) {
  if (!data) {
    return "Request failed.";
  }

  if (data.message) {
    return data.message;
  }

  if (data.title) {
    return data.title;
  }

  const firstValidationError = Object.values(data.errors ?? {})[0]?.[0];

  return firstValidationError ?? "Request failed.";
}

// Main function to perform API requests with proper error handling and authentication
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check that the backend is running and CORS is configured.",
    );
  }

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      getBackendErrorMessage(data),
      response.status,
      data?.details,
      data?.errors,
    );
  }

  return data as T;
}
