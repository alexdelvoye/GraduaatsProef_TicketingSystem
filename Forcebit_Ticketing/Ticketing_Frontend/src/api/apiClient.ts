import { getAuthItem } from "../storage/authStorage";

const API_URL = "http://localhost:5047/api";

type BackendErrorResponse = {
  statusCode?: number;
  message?: string;
  details?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  statusCode?: number;
  details?: string;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode?: number,
    details?: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.errors = errors;
  }
}

function isJsonResponse(response: Response) {
  return response.headers.get("content-type")?.includes("application/json");
}

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

export async function apiFetch(path: string, options: RequestInit = {}) {
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
      "Could not reach the server. Check that the backend is running and CORS is configured."
    );
  }

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      getBackendErrorMessage(data),
      response.status,
      data?.details,
      data?.errors
    );
  }

  return data;
}
