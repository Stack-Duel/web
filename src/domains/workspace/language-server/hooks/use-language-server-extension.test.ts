import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useLanguageServerExtension } from "./use-language-server-extension";
import { startLanguageServerSession } from "../api/start-language-server-session";
import { endLanguageServerSession } from "../api/end-language-server-session";

vi.mock("@/env", () => import("@/test/mocks/env"));

vi.mock("@auth0/nextjs-auth0", () => ({
  getAccessToken: vi.fn().mockResolvedValue("token-123"),
}));

vi.mock("../api/start-language-server-session", () => ({
  startLanguageServerSession: vi.fn(),
}));

vi.mock("../api/end-language-server-session", () => ({
  endLanguageServerSession: vi.fn(),
}));

const sentinelExtension = { kind: "sentinel" };

vi.mock("codemirror-languageserver", () => ({
  WebSocketTransport: vi.fn(),
  languageServerWithTransport: vi.fn(() => [sentinelExtension]),
}));

const mockStartSession = vi.mocked(startLanguageServerSession);
const mockEndSession = vi.mocked(endLanguageServerSession);

describe("useLanguageServerExtension", () => {
  it("does not start a session for a language without LSP support", async () => {
    const { result } = renderHook(() =>
      useLanguageServerExtension("javascript")
    );

    await waitFor(() => expect(result.current).toEqual([]));
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it("does not start a session when no language is given", () => {
    const { result } = renderHook(() => useLanguageServerExtension(undefined));

    expect(result.current).toEqual([]);
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it("starts a session and attaches the extension for a supported language", async () => {
    mockStartSession.mockResolvedValue({
      sessionId: "session-1",
      rootUri: "file:///workspace/",
      documentUri: "file:///workspace/Solution.java",
      languageId: "java",
      initializationOptions: null,
    });

    const { result } = renderHook(() => useLanguageServerExtension("java"));

    await waitFor(() => expect(result.current).toEqual([sentinelExtension]));
    expect(mockStartSession).toHaveBeenCalledWith({ language: "java" });
  });

  it("ends the session on unmount", async () => {
    mockStartSession.mockResolvedValue({
      sessionId: "session-2",
      rootUri: "file:///workspace/",
      documentUri: "file:///workspace/Solution.java",
      languageId: "java",
      initializationOptions: null,
    });

    const { result, unmount } = renderHook(() =>
      useLanguageServerExtension("java")
    );

    await waitFor(() => expect(result.current).toEqual([sentinelExtension]));

    unmount();

    expect(mockEndSession).toHaveBeenCalledWith("session-2");
  });

  it("degrades gracefully when session creation fails", async () => {
    mockStartSession.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useLanguageServerExtension("java"));

    await waitFor(() => expect(result.current).toEqual([]));
  });

  it("ends the session and never attaches it if the language changed before it resolved", async () => {
    let resolveSession: (
      session: Awaited<ReturnType<typeof startLanguageServerSession>>
    ) => void;
    mockStartSession.mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve;
      })
    );

    const { result, rerender } = renderHook(
      ({ language }) => useLanguageServerExtension(language),
      { initialProps: { language: "java" } }
    );

    rerender({ language: "javascript" });

    resolveSession!({
      sessionId: "stale-session",
      rootUri: "file:///workspace/",
      documentUri: "file:///workspace/Solution.java",
      languageId: "java",
      initializationOptions: null,
    });

    await waitFor(() =>
      expect(mockEndSession).toHaveBeenCalledWith("stale-session")
    );
    expect(result.current).toEqual([]);
  });

  it("clears the extension when the language server connection errors or closes", async () => {
    let capturedOnError: (() => void) | undefined;
    let capturedOnClose: (() => void) | undefined;
    const { languageServerWithTransport } =
      await import("codemirror-languageserver");
    vi.mocked(languageServerWithTransport).mockImplementation((options) => {
      capturedOnError = options.onError as () => void;
      capturedOnClose = options.onClose as () => void;
      return [sentinelExtension] as unknown as ReturnType<
        typeof languageServerWithTransport
      >;
    });

    mockStartSession.mockResolvedValue({
      sessionId: "session-3",
      rootUri: "file:///workspace/",
      documentUri: "file:///workspace/Solution.java",
      languageId: "java",
      initializationOptions: null,
    });

    const { result } = renderHook(() => useLanguageServerExtension("java"));

    await waitFor(() => expect(result.current).toEqual([sentinelExtension]));

    act(() => capturedOnError!());
    expect(result.current).toEqual([]);

    mockStartSession.mockResolvedValue({
      sessionId: "session-4",
      rootUri: "file:///workspace/",
      documentUri: "file:///workspace/Solution.java",
      languageId: "java",
      initializationOptions: null,
    });
    const { result: result2 } = renderHook(() =>
      useLanguageServerExtension("java")
    );
    await waitFor(() => expect(result2.current).toEqual([sentinelExtension]));

    act(() => capturedOnClose!());
    expect(result2.current).toEqual([]);
  });
});
