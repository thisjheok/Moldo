import { getApiBaseUrl } from "./config";

type ApiErrorPayload = {
  detail?: string;
};

export type ApiRequestInit = RequestInit & {
  cookieHeader?: string;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  if (!body) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(body);
  }

  if (contentType.startsWith("text/")) {
    return body;
  }

  return body;
}

function getErrorMessage(status: number, payload: unknown): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as ApiErrorPayload).detail;

    if (detail) {
      return detail;
    }
  }

  return `API request failed with status ${status}.`;
}

export async function apiRequest<T>(path: string, init?: ApiRequestInit): Promise<T> {
  const { cookieHeader, ...requestInit } = init ?? {};

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...requestInit.headers,
    },
    cache: "no-store",
    credentials: "include",
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(response.status, payload), response.status, payload);
  }

  return payload as T;
}
