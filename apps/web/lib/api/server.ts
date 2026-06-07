import { cookies } from "next/headers";
import { getAuthSession } from ".";

export async function getServerCookieHeader(): Promise<string> {
  return (await cookies()).toString();
}

export async function getServerIsAuthenticated(cookieHeader?: string): Promise<boolean> {
  const authCookieHeader = cookieHeader ?? (await getServerCookieHeader());

  try {
    await getAuthSession({ cookieHeader: authCookieHeader });
    return true;
  } catch {
    return false;
  }
}
