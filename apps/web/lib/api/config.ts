const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:8000";

function getServerOrigin(): string | null {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return null;
}

export function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    const normalizedBaseUrl = configuredBaseUrl.replace(/\/$/, "");

    if (normalizedBaseUrl.startsWith("/")) {
      if (typeof window !== "undefined") {
        return normalizedBaseUrl;
      }

      const serverOrigin = getServerOrigin();
      if (serverOrigin) {
        return `${serverOrigin}${normalizedBaseUrl}`;
      }
    }

    return normalizedBaseUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:8000`;
    }

    return DEFAULT_LOCAL_API_BASE_URL;
  }

  throw new Error("NEXT_PUBLIC_API_BASE_URL is required in production.");
}
