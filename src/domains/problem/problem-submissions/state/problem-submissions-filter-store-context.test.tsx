import { describe, expect, it } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ProblemSubmissionsFilterProvider,
  useProblemSubmissionsFilterStore,
} from "./problem-submissions-filter-store-context";
import { SubmissionFilterType } from "../models/submission-filter-type";

describe("useProblemSubmissionsFilterStore", () => {
  it("throws when used outside a ProblemSubmissionsFilterProvider", () => {
    expect(() =>
      renderHook(() => useProblemSubmissionsFilterStore((s) => s.type))
    ).toThrow(
      "useProblemSubmissionsFilterStore must be used within ProblemSubmissionsFilterProvider"
    );
  });

  it("reads the store's default state inside the provider", () => {
    const { result } = renderHook(
      () => useProblemSubmissionsFilterStore((s) => s.type),
      { wrapper: ProblemSubmissionsFilterProvider }
    );

    expect(result.current).toBe(SubmissionFilterType.UserSolutions);
  });

  it("reacts to setType calls from a consumer", async () => {
    function Consumer() {
      const type = useProblemSubmissionsFilterStore((s) => s.type);
      const setType = useProblemSubmissionsFilterStore((s) => s.setType);
      return (
        <button onClick={() => setType(SubmissionFilterType.MySubmissions)}>
          {type}
        </button>
      );
    }

    const user = userEvent.setup();
    render(
      <ProblemSubmissionsFilterProvider>
        <Consumer />
      </ProblemSubmissionsFilterProvider>
    );

    expect(
      screen.getByRole("button", { name: SubmissionFilterType.UserSolutions })
    ).toBeVisible();

    await user.click(screen.getByRole("button"));

    expect(
      screen.getByRole("button", { name: SubmissionFilterType.MySubmissions })
    ).toBeVisible();
  });

  it("gives each provider mount its own store instance", () => {
    function Reader() {
      const type = useProblemSubmissionsFilterStore((s) => s.type);
      return <span>{type}</span>;
    }

    const { unmount } = render(
      <ProblemSubmissionsFilterProvider>
        <Reader />
      </ProblemSubmissionsFilterProvider>
    );
    unmount();

    render(
      <ProblemSubmissionsFilterProvider>
        <Reader />
      </ProblemSubmissionsFilterProvider>
    );

    expect(screen.getByText(SubmissionFilterType.UserSolutions)).toBeVisible();
  });
});
