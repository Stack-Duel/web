import { env } from "@/env";

export async function fetchFeatureFlags() {
  return fetch(`${env.NEXT_PUBLIC_API_SERVER_URL}/api/v1/feature-flag`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
