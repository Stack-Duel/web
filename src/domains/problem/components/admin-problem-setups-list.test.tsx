import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminProblemSetupsList from "./admin-problem-setups-list";
import { buildAdminProblemSetup } from "@/test/factories/problem";

vi.mock("@/env", () => import("@/test/mocks/env"));

describe("AdminProblemSetupsList", () => {
  it("shows an empty message when there are no setups", () => {
    render(<AdminProblemSetupsList setups={[]} />);

    expect(
      screen.getByText("No language setups configured for this problem.")
    ).toBeVisible();
  });

  it("lists each setup's language and function name", () => {
    render(
      <AdminProblemSetupsList
        setups={[
          buildAdminProblemSetup({
            id: "setup_1",
            languageName: "JavaScript",
            languageVersion: "ES2022",
            functionName: "twoSum",
          }),
          buildAdminProblemSetup({
            id: "setup_2",
            languageName: "Python",
            languageVersion: "3.12",
            functionName: "two_sum",
          }),
        ]}
      />
    );

    expect(screen.getByText("JavaScript ES2022")).toBeVisible();
    expect(screen.getByText("twoSum")).toBeVisible();
    expect(screen.getByText("Python 3.12")).toBeVisible();
    expect(screen.getByText("two_sum")).toBeVisible();
  });

  it("shows reference solution and generation spec badges when present", () => {
    render(
      <AdminProblemSetupsList
        setups={[
          buildAdminProblemSetup({
            hasReferenceSolution: true,
            hasGenerationSpec: true,
          }),
        ]}
      />
    );

    expect(screen.getByText("Reference solution")).toBeVisible();
    expect(screen.getByText("Generation spec")).toBeVisible();
  });

  it("hides reference solution and generation spec badges when absent", () => {
    render(
      <AdminProblemSetupsList
        setups={[
          buildAdminProblemSetup({
            hasReferenceSolution: false,
            hasGenerationSpec: false,
          }),
        ]}
      />
    );

    expect(screen.queryByText("Reference solution")).not.toBeInTheDocument();
    expect(screen.queryByText("Generation spec")).not.toBeInTheDocument();
  });

  it("reveals test suite/case counts and initial code when a setup is expanded", async () => {
    const user = userEvent.setup();
    render(
      <AdminProblemSetupsList
        setups={[
          buildAdminProblemSetup({
            testSuiteCount: 3,
            testCaseCount: 12,
            initialCode: "function twoSum() {}",
          }),
        ]}
      />
    );

    expect(screen.queryByText("function twoSum() {}")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("3")).toBeVisible();
    expect(screen.getByText("12")).toBeVisible();
    expect(screen.getByText("function twoSum() {}")).toBeVisible();
  });
});
