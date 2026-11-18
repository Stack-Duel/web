import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "@/shared/components/ui/tabs";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";
import type { StudioProblemPublishReadiness } from "@/domains/studio/models/studio-problem-publish-readiness";
import StudioProblemEditSectionNav from "./studio-problem-edit-section-nav";
import { StudioProblemEditProvider } from "./studio-problem-edit-store-context";
import { StudioProblemSetupsProvider } from "./setups/studio-problem-setups-store-context";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

function buildReadiness(
  overrides: Partial<StudioProblemPublishReadiness> = {}
): StudioProblemPublishReadiness {
  return {
    canSubmit: true,
    isReady: false,
    requirementsMet: 2,
    requirementCount: 4,
    setupCount: 4,
    languagesMissingReferenceSolution: ["Go", "C#"],
    sampleTestCaseCount: 6,
    hasGenerationParameters: false,
    attemptCount: 0,
    lastSubmittedAt: null,
    lastCompletedAt: null,
    lastAttemptStatus: null,
    lastFailureReason: null,
    ...overrides,
  };
}

function renderNav(readiness: StudioProblemPublishReadiness | null) {
  const details = buildStudioProblemDetails({ tags: ["arrays"] });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <StudioProblemEditProvider details={details}>
        <StudioProblemSetupsProvider>
          <Tabs orientation="vertical" defaultValue="details">
            {children}
          </Tabs>
        </StudioProblemSetupsProvider>
      </StudioProblemEditProvider>
    </QueryClientProvider>
  );

  return render(
    <StudioProblemEditSectionNav problemId="problem_1" readiness={readiness} />,
    {
      wrapper: Wrapper,
    }
  );
}

describe("StudioProblemEditSectionNav", () => {
  it("lists the four numbered sections as tabs", () => {
    renderNav(buildReadiness());

    const tabs = screen.getAllByRole("tab");

    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toHaveTextContent("01Details");
    expect(tabs[1]).toHaveTextContent("02Setups");
    expect(tabs[2]).toHaveTextContent("03Sample cases");
    expect(tabs[3]).toHaveTextContent("04Generation");
  });

  it("starts with the details tab selected", () => {
    renderNav(buildReadiness());

    expect(screen.getByRole("tab", { name: /Details/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("selects the tab that is clicked", async () => {
    const user = userEvent.setup();
    renderNav(buildReadiness());

    await user.click(screen.getByRole("tab", { name: /Sample cases/ }));

    expect(screen.getByRole("tab", { name: /Sample cases/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("marks a section ready when its requirements are met", () => {
    renderNav(buildReadiness());

    expect(
      within(screen.getByRole("tab", { name: /Sample cases/ })).getByLabelText(
        "ready"
      )
    ).toBeInTheDocument();
  });

  it("marks a section with unmet requirements", () => {
    renderNav(buildReadiness());

    expect(
      within(screen.getByRole("tab", { name: /Generation/ })).getByLabelText(
        "requirements unmet"
      )
    ).toBeInTheDocument();
  });

  it("flags the details section as dirty once it is edited", async () => {
    const user = userEvent.setup();
    renderNav(buildReadiness());

    const detailsTab = screen.getByRole("tab", { name: /Details/ });

    expect(
      within(detailsTab).queryByLabelText("unsaved changes")
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Setups/ }));

    expect(
      within(screen.getByRole("tab", { name: /Setups/ })).queryByLabelText(
        "unsaved changes"
      )
    ).not.toBeInTheDocument();
  });

  it("summarises readiness beneath the tabs", () => {
    renderNav(buildReadiness());

    expect(screen.getByText("2 of 4 ready")).toBeVisible();
    expect(screen.getByText("4 setups")).toBeVisible();
    expect(screen.getByText("2 reference solutions")).toBeVisible();
    expect(screen.getByText("Generation params")).toBeVisible();
  });

  it("omits the readiness summary when there is none", () => {
    renderNav(null);

    expect(screen.queryByText(/of 4 ready/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
  });
});
