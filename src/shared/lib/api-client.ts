import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/env";
import {
  extractErrorMessage,
  SessionExpiredError,
  type ProblemDetailsBody,
} from "./api-error";
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

  const result = await getSharedAccessToken();

  // Don't bother sending a request we already know will come back 401.
  if (result.status === "session-expired") throw new SessionExpiredError();

  if (result.status === "token") {
    config.headers.Authorization = `Bearer ${result.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isCancel(error)) throw error;

    // Axios routes request-interceptor rejections through here too, so the typed
    // error has to be passed along before it gets flattened into a message.
    if (error instanceof SessionExpiredError) throw error;

    const axiosError = error as AxiosError<ProblemDetailsBody>;

    const original = axiosError.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      axiosError.response?.status === 401 &&
      original &&
      isApiServerRequest(original) &&
      !original._retry
    ) {
      original._retry = true;
      const result = await getSharedAccessToken();
      if (result.status === "token") {
        original.headers.Authorization = `Bearer ${result.token}`;
        return apiClient(original);
      }

      throw new SessionExpiredError();
    }

    throw new Error(
      extractErrorMessage(axiosError.response?.data, axiosError.message)
    );
  }
);
