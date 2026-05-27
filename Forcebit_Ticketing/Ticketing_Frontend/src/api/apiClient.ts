import { getAuthItem } from "../storage/authStorage";

// Central API base URL. Keeping this in one file makes it easy to switch from
// localhost to a LAN IP when testing on a physical device.
export const API_URL = "http://localhost:5047/api";

// Expected structure of backend errors. It supports both our custom exception
// middleware response and ASP.NET validation responses.
type BackendErrorResponse = {
  statusCode?: number;
  message?: string;
  details?: string;
  traceId?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

// Custom error class for API failures. Components can show message to the user,
// while developers can still inspect statusCode/details/traceId when debugging.
export class ApiError extends Error {
  statusCode?: number;
  details?: string;
  traceId?: string;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode?: number,
    details?: string,
    errors?: Record<string, string[]>,
    traceId?: string,
  ) {
    // Error's base constructor stores the message and stack trace.
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.errors = errors;
    this.traceId = traceId;
  }
}

// Check the content type before reading JSON. Calling response.json() on a text
// or empty response would throw.
function isJsonResponse(response: Response) {
  return response.headers.get("content-type")?.includes("application/json");
}

// Read the response body in a safe way. Some successful endpoints may return
// 204 No Content, and some errors may return plain text instead of JSON.
async function readResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  if (isJsonResponse(response)) {
    try {
      return (await response.json()) as BackendErrorResponse;
    } catch {
      // JSON content type was announced, but parsing failed. Return a readable
      // message instead of crashing with a low-level JSON error.
      return { message: "The server returned an invalid response." };
    }
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

// Choose the best user-facing message from the backend response.
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

  // ASP.NET validation errors are grouped by field name. Showing the first one
  // gives the user a useful message without dumping the entire object.
  return firstValidationError ?? "Request failed.";
}

function isFormDataBody(body: BodyInit | null | undefined) {
  // React Native and browser FormData implementations are not always reliable
  // with instanceof checks across runtimes. Checking for append() is enough for
  // our API client because other request bodies are strings/undefined.
  return Boolean(
    body &&
    typeof body === "object" &&
    "append" in body &&
    typeof (body as { append?: unknown }).append === "function",
  );
}

// Main API helper. Every API function goes through here so authentication,
// response reading, and error handling stay consistent across the app.
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // The token is loaded at request time so newly logged-in users immediately
  // get authenticated requests without recreating the API client.
  const token = await getAuthItem("token");

  const isMultipartRequest = isFormDataBody(options.body);

  // Merge default headers with caller-provided headers. FormData must not get
  // an explicit Content-Type because React Native adds the multipart boundary.
  const headers = {
    ...(!isMultipartRequest ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response: Response;

  try {
    // fetch only rejects for network-level problems. HTTP 400/500 responses are
    // handled below with response.ok.
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
    // Throw our ApiError so useErrorHandler can show a clean message and keep
    // extra debugging fields available.
    throw new ApiError(
      getBackendErrorMessage(data),
      response.status,
      data?.details,
      data?.errors,
      data?.traceId,
    );
  }

  // For normal success responses, callers receive typed data.
  return data as T;
}
