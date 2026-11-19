import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";
import type { StudioProblemPublishReadiness } from "@/domains/studio/models/studio-problem-publish-readiness";
import { useSuspenseStudioProblemDetails } from "../../../api/get-studio-problem";
import StudioProblemPublishChecklist from "./studio-problem-publish-checklist";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../../api/get-studio-problem", () => ({
  useSuspenseStudioProblemDetails: vi.fn(),
}));

const mockUseDetails = vi.mocked(useSuspenseStudioProblemDetails);

function buildReadiness(
  overrides: Partial<StudioProblemPublishReadiness> = {}
): StudioProblemPublishReadiness {
  return {
    canSubmit: true,
    isReady: false,
    requirementsMet: 0,
    requirementCount: 4,
    setupCount: 0,
    languagesMissingReferenceSolution: [],
    sampleTestCaseCount: 0,
    hasGenerationParameters: false,
    attemptCount: 0,
    lastSubmittedAt: null,
    lastCompletedAt: null,
    lastAttemptStatus: null,
    lastFailureReason: null,
    steps: null,
    ...overrides,
  };
}

function renderStatus(readiness: StudioProblemPublishReadiness) {
  mockUseDetails.mockReturnValue({
    data: buildStudioProblemDetails({ publishReadiness: readiness }),
  } as unknown as ReturnType<typeof useSuspenseStudioProblemDetails>);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  render(<StudioProblemPublishChecklist id="problem_1" />, {
    wrapper: Wrapper,
  });
}

describe("StudioProblemPublishChecklist", () => {
  it("links a missing setup to the setups tab of the editor", () => {
    renderStatus(buildReadiness());

    expect(
      screen.getAllByRole("link", { name: "Open Setups" })[0]
    ).toHaveAttribute("href", "/studio/problems/problem_1/edit?section=setups");
  });

  it("links missing sample cases to the sample cases tab", () => {
    renderStatus(buildReadiness({ setupCount: 2 }));

    expect(
      screen.getByRole("link", { name: "Open Sample cases" })
    ).toHaveAttribute(
      "href",
      "/studio/problems/problem_1/edit?section=sample-cases"
    );
  });

  it("links a missing reference solution to the setups tab", () => {
    renderStatus(
      buildReadiness({
        setupCount: 2,
        languagesMissingReferenceSolution: ["Go"],
      })
    );

    expect(
      screen.getAllByRole("link", { name: "Open Setups" }).at(-1)
    ).toHaveAttribute("href", "/studio/problems/problem_1/edit?section=setups");
  });

  it("links missing generation parameters to the generation tab", () => {
    renderStatus(buildReadiness());

    expect(
      screen.getByRole("link", { name: "Open Generation" })
    ).toHaveAttribute(
      "href",
      "/studio/problems/problem_1/edit?section=generation"
    );
  });

  it("drops the action once a requirement is met", () => {
    renderStatus(
      buildReadiness({
        setupCount: 2,
        sampleTestCaseCount: 3,
        hasGenerationParameters: true,
      })
    );

    expect(
      screen.queryByRole("link", { name: "Open Generation" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Open Sample cases" })
    ).not.toBeInTheDocument();
  });
});
