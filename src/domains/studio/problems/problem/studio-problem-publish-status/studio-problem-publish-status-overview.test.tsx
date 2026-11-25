import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";
import type { StudioProblemDetails } from "@/domains/studio/models/studio-problem-details";
import type { StudioProblemPublishReadiness } from "@/domains/studio/models/studio-problem-publish-readiness";
import { useSuspenseStudioProblemDetails } from "../../../api/get-studio-problem";
import StudioProblemPublishStatusOverview from "./studio-problem-publish-status-overview";

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
    requirementsMet: 2,
    requirementCount: 4,
    setupCount: 2,
    languagesMissingReferenceSolution: [],
    sampleTestCaseCount: 0,
    hasGenerationParameters: false,
    attemptCount: 0,
    lastSubmittedAt: null,
    lastCompletedAt: null,
    lastAttemptStatus: null,
    lastFailureReason: null,
    steps: null,
    processingAttempts: 0,
    lastError: null,
    hasUnpublishedChanges: false,
    isRevalidating: false,
    ...overrides,
  };
}

function renderOverview(overrides: Partial<StudioProblemDetails>) {
  mockUseDetails.mockReturnValue({
    data: buildStudioProblemDetails(overrides),
  } as unknown as ReturnType<typeof useSuspenseStudioProblemDetails>);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  render(<StudioProblemPublishStatusOverview id="problem_1" />, {
    wrapper: Wrapper,
  });
}

describe("StudioProblemPublishStatusOverview", () => {
  it("shows the checklist while the problem is a draft", () => {
    renderOverview({ status: "Draft", publishReadiness: buildReadiness() });

    expect(screen.getByText("Ready to publish?")).toBeVisible();
    expect(screen.queryByText("Publishing")).not.toBeInTheDocument();
  });

  it("shows the pipeline while validation is running", () => {
    renderOverview({
      status: "Pending",
      publishReadiness: buildReadiness({ lastAttemptStatus: "Pending" }),
    });

    expect(screen.getByText("Publishing")).toBeVisible();
    expect(screen.queryByText("Ready to publish?")).not.toBeInTheDocument();
  });

  it("keeps showing the pipeline after a failed attempt", () => {
    renderOverview({
      status: "Failed",
      publishReadiness: buildReadiness({
        lastAttemptStatus: "Failed",
        lastFailureReason: "Go reference solution timed out",
      }),
    });

    expect(screen.getByText("Publishing failed")).toBeVisible();
    expect(screen.getByText("Go reference solution timed out")).toBeVisible();
  });

  it("hides the publish status once the problem is published", () => {
    renderOverview({
      status: "Published",
      publishReadiness: buildReadiness({
        lastAttemptStatus: "Completed",
        isReady: true,
      }),
    });

    expect(screen.queryByText("Ready to publish?")).not.toBeInTheDocument();
    expect(screen.queryByText("Publishing")).not.toBeInTheDocument();
  });

  it("shows the pipeline while a published problem is revalidating", () => {
    renderOverview({
      status: "Published",
      publishReadiness: buildReadiness({
        isRevalidating: true,
        hasUnpublishedChanges: true,
        lastAttemptStatus: "Pending",
      }),
    });

    expect(screen.getByText("Publishing")).toBeVisible();
  });

  it("hides the publish status for a published problem with unpublished changes", () => {
    renderOverview({
      status: "Published",
      publishReadiness: buildReadiness({
        isRevalidating: false,
        hasUnpublishedChanges: true,
      }),
    });

    expect(screen.queryByText("Ready to publish?")).not.toBeInTheDocument();
  });

  it("keeps showing the pipeline after a published problem fails to republish", () => {
    renderOverview({
      status: "Published",
      publishReadiness: buildReadiness({
        hasUnpublishedChanges: true,
        lastAttemptStatus: "Failed",
        lastFailureReason: "Go reference solution timed out",
      }),
    });

    expect(screen.getByText("Publishing failed")).toBeVisible();
  });
});
