import { cookies } from "next/headers";

export async function getServerCookieHeader(): Promise<string> {
  return (await cookies()).toString();
}
