import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { waitForTerminalSubmission } from "./wait-for-terminal-submission";
import { http } from "@/shared/lib/http";
import {
  connectSubmissionHub,
  onSubmissionCompletedPush,
} from "@/shared/lib/signalr/submission-hub-client";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/shared/lib/signalr/submission-hub-client", () => ({
  connectSubmissionHub: vi.fn(),
  onSubmissionCompletedPush: vi.fn(),
}));

const mockedHttp = vi.mocked(http, { deep: true });
const mockedConnect = vi.mocked(connectSubmissionHub);
const mockedOnPush = vi.mocked(onSubmissionCompletedPush);

function buildStatus(overrides: Partial<{ status: string }> = {}) {
  return {
    submissionId: "submission_1",
    problemSetupId: "setup_1",
    status: "Accepted",
    code: "code",
    results: [],
    ...overrides,
  };
}

describe("waitForTerminalSubmission", () => {
  let queryClient: QueryClient;
  const unsubscribe = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient();
    mockedConnect.mockResolvedValue(undefined);
    mockedOnPush.mockReturnValue(unsubscribe);
    unsubscribe.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves once the push for the matching submission id arrives", async () => {
    mockedHttp.get.mockResolvedValue(buildStatus());
    let pushHandler: (payload: { submissionId: string }) => void = () => {};
    mockedOnPush.mockImplementation((handler) => {
      pushHandler = handler;
      return unsubscribe;
    });

    const resultPromise = waitForTerminalSubmission(
      queryClient,
      "submission_1"
    );
    await Promise.resolve();
    await Promise.resolve();
    pushHandler({ submissionId: "submission_1" });

    const result = await resultPromise;

    expect(result.status).toBe("Accepted");
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/submission/submission_1",
      expect.anything()
    );
  });

  it("ignores a push for a different submission id", async () => {
    vi.useFakeTimers();
    mockedHttp.get.mockResolvedValue(buildStatus());
    let pushHandler: (payload: { submissionId: string }) => void = () => {};
    mockedOnPush.mockImplementation((handler) => {
      pushHandler = handler;
      return unsubscribe;
    });

    const resultPromise = waitForTerminalSubmission(
      queryClient,
      "submission_1"
    );
    pushHandler({ submissionId: "other-submission" });

    await vi.advanceTimersByTimeAsync(60_000);
    const result = await resultPromise;

    expect(result.status).toBe("Accepted");
  });

  it("falls back to fetching status after the 60s timeout when no push arrives", async () => {
    vi.useFakeTimers();
    mockedHttp.get.mockResolvedValue(buildStatus({ status: "WrongAnswer" }));

    const resultPromise = waitForTerminalSubmission(
      queryClient,
      "submission_1"
    );
    await vi.advanceTimersByTimeAsync(60_000);
    const result = await resultPromise;

    expect(result.status).toBe("WrongAnswer");
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("still fetches the status when the hub connection fails", async () => {
    mockedConnect.mockRejectedValue(new Error("hub unavailable"));
    mockedHttp.get.mockResolvedValue(buildStatus());

    const result = await waitForTerminalSubmission(queryClient, "submission_1");

    expect(result.status).toBe("Accepted");
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/submission/submission_1",
      expect.anything()
    );
  });
});
