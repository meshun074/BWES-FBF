import { env } from "@/config/env";

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${normalizedPath}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
}
