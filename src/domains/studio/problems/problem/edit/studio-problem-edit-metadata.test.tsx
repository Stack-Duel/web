import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "@/shared/lib/http";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";
import type { StudioProblemDetails } from "@/domains/studio/models/studio-problem-details";
import StudioProblemEditMetadata from "./studio-problem-edit-metadata";
import { StudioProblemEditProvider } from "./studio-problem-edit-store-context";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockedHttp = vi.mocked(http, { deep: true });

const longEnoughQuestion = "q".repeat(60);

function renderMetadata(overrides: Partial<StudioProblemDetails> = {}) {
  const details = buildStudioProblemDetails({
    problemId: "problem_1",
    title: "Two Sum",
    question: longEnoughQuestion,
    difficultyValue: 800,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    status: "Draft",
    tags: ["arrays"],
    ...overrides,
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <StudioProblemEditProvider details={details}>
        {children}
      </StudioProblemEditProvider>
    </QueryClientProvider>
  );

  return render(
    <StudioProblemEditMetadata problemId="problem_1" trackId={null} />,
    {
      wrapper: Wrapper,
    }
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedHttp.put.mockResolvedValue(undefined);
});

describe("StudioProblemEditMetadata", () => {
  it("prefills the fields from the loaded problem", () => {
    renderMetadata();

    expect(screen.getByLabelText("Title")).toHaveValue("Two Sum");
    expect(screen.getByLabelText("Difficulty")).toHaveValue(800);
    expect(screen.getByLabelText("Time limit (ms)")).toHaveValue(2000);
    expect(screen.getByLabelText("Memory limit (MB)")).toHaveValue(256);
  });

  it("keeps saving disabled until something changes", async () => {
    const user = userEvent.setup();
    renderMetadata();

    expect(screen.getByRole("button", { name: "Save details" })).toBeDisabled();

    await user.type(screen.getByLabelText("Title"), "!");

    expect(screen.getByRole("button", { name: "Save details" })).toBeEnabled();
  });

  it("saves the edited metadata", async () => {
    const user = userEvent.setup();
    renderMetadata();

    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Three Sum");
    await user.click(screen.getByRole("button", { name: "Save details" }));

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/studio/problems/problem_1",
        {
          title: "Three Sum",
          question: longEnoughQuestion,
          difficulty: 800,
          timeLimitMs: 2000,
          memoryLimitMb: 256,
          tags: ["arrays"],
        },
        expect.anything()
      )
    );
  });

  it("refuses to save while a field is invalid", async () => {
    const user = userEvent.setup();
    renderMetadata();

    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "ab");
    await user.click(screen.getByRole("button", { name: "Save details" }));

    expect(mockedHttp.put).not.toHaveBeenCalled();
    expect(
      screen.getByText("Title must be at least 3 characters")
    ).toBeVisible();
  });

  it("saves a published problem's wording change without confirmation", async () => {
    const user = userEvent.setup();
    renderMetadata({ status: "Published" });

    await user.type(screen.getByLabelText("Title"), " Revisited");
    await user.click(screen.getByRole("button", { name: "Save details" }));

    await waitFor(() => expect(mockedHttp.put).toHaveBeenCalledTimes(1));
  });

  it("asks for confirmation before changing a published problem's limits", async () => {
    const user = userEvent.setup();
    renderMetadata({ status: "Published", attemptCount: 42 });

    const timeLimit = screen.getByLabelText("Time limit (ms)");
    await user.clear(timeLimit);
    await user.type(timeLimit, "400");
    await user.tab();
    await user.click(screen.getByRole("button", { name: "Save details" }));

    expect(mockedHttp.put).not.toHaveBeenCalled();
    expect(screen.getByText(/42 recorded attempts/)).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Save the new limits" })
    );

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/studio/problems/problem_1",
        expect.objectContaining({ timeLimitMs: 400 }),
        expect.anything()
      )
    );
  });

  it("abandons the save when the limit change is not confirmed", async () => {
    const user = userEvent.setup();
    renderMetadata({ status: "Published" });

    const memoryLimit = screen.getByLabelText("Memory limit (MB)");
    await user.clear(memoryLimit);
    await user.type(memoryLimit, "64");
    await user.tab();
    await user.click(screen.getByRole("button", { name: "Save details" }));

    await user.click(
      screen.getByRole("button", { name: "Keep the current limits" })
    );

    expect(mockedHttp.put).not.toHaveBeenCalled();
  });

  it("restores the loaded values when changes are discarded", async () => {
    const user = userEvent.setup();
    renderMetadata();

    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Three Sum");
    await user.click(screen.getByRole("button", { name: "Discard" }));

    expect(title).toHaveValue("Two Sum");
    expect(screen.getByRole("button", { name: "Save details" })).toBeDisabled();
  });
});
