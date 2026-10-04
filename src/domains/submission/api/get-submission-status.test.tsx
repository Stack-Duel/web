import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getSubmissionStatus,
  submissionStatusQueryKey,
  useSubmissionStatus,
} from "./get-submission-status";
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

const unsubscribe = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockedConnect.mockResolvedValue(undefined);
  mockedOnPush.mockReturnValue(unsubscribe);
});

describe("getSubmissionStatus", () => {
  it("requests the submission status by id", async () => {
    const dto = {
      submissionId: "submission_1",
      problemSetupId: "setup_1",
      status: "Accepted" as const,
      code: "code",
      results: [],
    };
    mockedHttp.get.mockResolvedValue(dto);

    const result = await getSubmissionStatus({ submissionId: "submission_1" });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/submission/submission_1",
      expect.anything()
    );
    expect(result).toEqual(dto);
  });
});

describe("submissionStatusQueryKey", () => {
  it("scopes the query key by submission id", () => {
    expect(submissionStatusQueryKey("submission_1")).toEqual([
      "submission-status",
      "submission_1",
    ]);
  });
});

describe("useSubmissionStatus", () => {
  it("does not fetch when submissionId is null", () => {
    renderHook(() => useSubmissionStatus(null), { wrapper: createWrapper() });

    expect(mockedHttp.get).not.toHaveBeenCalled();
    expect(mockedConnect).not.toHaveBeenCalled();
  });

  it("fetches the status for a given submission id", async () => {
    mockedHttp.get.mockResolvedValue({
      submissionId: "submission_1",
      problemSetupId: "setup_1",
      status: "Accepted",
      code: "code",
      results: [],
    });

    const { result } = renderHook(() => useSubmissionStatus("submission_1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/submission/submission_1",
      expect.anything()
    );
    expect(result.current.data?.status).toBe("Accepted");
  });

  it("does not leave a dangling hub subscription once the status is terminal", async () => {
    mockedHttp.get.mockResolvedValue({
      submissionId: "submission_1",
      problemSetupId: "setup_1",
      status: "Accepted",
      code: "code",
      results: [],
    });

    const { result, unmount } = renderHook(
      () => useSubmissionStatus("submission_1"),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(mockedOnPush.mock.calls.length);
  });

  it("subscribes to the hub while pending and refetches when the push arrives", async () => {
    mockedHttp.get.mockResolvedValue({
      submissionId: "submission_1",
      problemSetupId: "setup_1",
      status: "Processing",
      code: "code",
      results: [],
    });

    let pushHandler: (payload: { submissionId: string }) => void = () => {};
    mockedOnPush.mockImplementation((handler) => {
      pushHandler = handler;
      return unsubscribe;
    });

    const { result } = renderHook(() => useSubmissionStatus("submission_1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(mockedConnect).toHaveBeenCalled());

    mockedHttp.get.mockResolvedValue({
      submissionId: "submission_1",
      problemSetupId: "setup_1",
      status: "Accepted",
      code: "code",
      results: [],
    });
    pushHandler({ submissionId: "submission_1" });

    await waitFor(() => expect(result.current.data?.status).toBe("Accepted"));
    expect(mockedHttp.get).toHaveBeenCalledTimes(2);
  });

  it("ignores a push for a different submission id", async () => {
    mockedHttp.get.mockResolvedValue({
      submissionId: "submission_1",
      problemSetupId: "setup_1",
      status: "Processing",
      code: "code",
      results: [],
    });

    let pushHandler: (payload: { submissionId: string }) => void = () => {};
    mockedOnPush.mockImplementation((handler) => {
      pushHandler = handler;
      return unsubscribe;
    });

    renderHook(() => useSubmissionStatus("submission_1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(mockedConnect).toHaveBeenCalled());
    pushHandler({ submissionId: "other-submission" });

    expect(mockedHttp.get).toHaveBeenCalledTimes(1);
  });
});
