import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminSubmissionSummaryPanel from "./admin-submission-summary-panel";
import {
  buildAdminSubmissionDetail,
  buildAdminSubmissionResult,
} from "@/test/factories/submission";

describe("AdminSubmissionSummaryPanel", () => {
  it("links to the problem and shows submission metadata", () => {
    render(
      <AdminSubmissionSummaryPanel
        submission={buildAdminSubmissionDetail({
          problemSlug: "two-sum",
          problemTitle: "Two Sum",
        })}
      />
    );

    expect(screen.getByRole("link", { name: "Two Sum" })).toHaveAttribute(
      "href",
      "/problems/two-sum"
    );
  });

  it("highlights an accepted status in green", () => {
    render(
      <AdminSubmissionSummaryPanel
        submission={buildAdminSubmissionDetail({ status: "Accepted" })}
      />
    );

    expect(screen.getAllByText("Accepted")[0]).toHaveClass("bg-green-600");
  });

  it("renders the source code as an output block", () => {
    render(
      <AdminSubmissionSummaryPanel
        submission={buildAdminSubmissionDetail({
          sourceCode: "function twoSum() {}",
        })}
      />
    );

    expect(screen.getByText("function twoSum() {}")).toBeVisible();
  });

  it("renders a results tab per test result", () => {
    render(
      <AdminSubmissionSummaryPanel
        submission={buildAdminSubmissionDetail({
          results: [
            buildAdminSubmissionResult({ testCaseId: "t1" }),
            buildAdminSubmissionResult({
              testCaseId: "t2",
              status: "WrongAnswer",
            }),
          ],
        })}
      />
    );

    expect(screen.getByRole("tab", { name: /Test 1/ })).toBeVisible();
    expect(screen.getByRole("tab", { name: /Test 2/ })).toBeVisible();
  });

  it("renders no results tabs when there are no results", () => {
    render(
      <AdminSubmissionSummaryPanel
        submission={buildAdminSubmissionDetail({ results: [] })}
      />
    );

    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });
});
