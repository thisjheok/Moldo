const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:8000";

export function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:8000`;
    }

    return DEFAULT_LOCAL_API_BASE_URL;
  }

  throw new Error("NEXT_PUBLIC_API_BASE_URL is required in production.");
}
