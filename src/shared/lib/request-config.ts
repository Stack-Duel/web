import type { AxiosRequestConfig } from "axios";

export type RequestConfig = {
  accessToken?: string;
  signal?: AbortSignal;
};

export function toAxiosConfig({
  accessToken,
  signal,
}: RequestConfig = {}): AxiosRequestConfig {
  return {
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
    signal,
  };
}
