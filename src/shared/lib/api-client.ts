import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/env";
import { extractErrorMessage, type ProblemDetailsBody } from "./api-error";
import { getSharedAccessToken } from "./get-shared-access-token";

function resolveRequestUrl(config: InternalAxiosRequestConfig): string {
  const url = config.url ?? "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${config.baseURL ?? ""}${url}`;
}

function isApiServerRequest(config: InternalAxiosRequestConfig): boolean {
  return resolveRequestUrl(config).startsWith(env.NEXT_PUBLIC_API_SERVER_URL);
}

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_SERVER_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

apiClient.interceptors.request.use(async (config) => {
  if (!isApiServerRequest(config)) return config;

  const accessToken = await getSharedAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetailsBody>) => {
    if (axios.isCancel(error)) throw error;

    const original = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      isApiServerRequest(original) &&
      !original._retry
    ) {
      original._retry = true;
      const accessToken = await getSharedAccessToken();
      if (accessToken) {
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      }

      throw new Error("Session expired. Please sign in again.");
    }

    throw new Error(extractErrorMessage(error.response?.data, error.message));
  }
);
