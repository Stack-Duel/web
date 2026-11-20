import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SampleTestCaseForm from "./sample-test-case-form";
import type { SampleTestCase } from "../models/sample-test-case";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const renderCounts = new Map<string, number>();

vi.mock("@/shared/components/ui/input", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/shared/components/ui/input")>();

  return {
    ...actual,
    Input: (props: React.ComponentProps<typeof actual.Input>) => {
      const key = `input:${props.id ?? props["aria-label"] ?? "unknown"}`;
      renderCounts.set(key, (renderCounts.get(key) ?? 0) + 1);
      return <actual.Input {...props} />;
    },
  };
});

function buildCase(overrides: Partial<SampleTestCase> = {}): SampleTestCase {
  return {
    name: "Example",
    inputs: [{ value: "1", valueType: "integer" }],
    expectedOutputValue: "2",
    expectedOutputValueType: "integer",
    ...overrides,
  };
}

function renderForm(testCases: SampleTestCase[], onSave = vi.fn()) {
  render(
    <SampleTestCaseForm
      initialTestCases={testCases}
      isSaving={false}
      onSave={onSave}
    />
  );

  return onSave;
}

beforeEach(() => {
  vi.clearAllMocks();
  renderCounts.clear();
});

describe("SampleTestCaseForm", () => {
  it("does not re-render other cases while one is typed in", async () => {
    const user = userEvent.setup();
    renderForm([buildCase({ name: "first" }), buildCase({ name: "second" })]);

    const [firstName] = screen.getAllByLabelText("Name");
    await user.type(firstName, "X");

    const otherNameKey = Array.from(renderCounts.keys()).find(
      (key) => key.startsWith("input:case-name-") && !key.endsWith(firstName.id)
    );
    const before = renderCounts.get(otherNameKey!);

    await user.type(firstName, "YZ");

    expect(renderCounts.get(otherNameKey!)).toBe(before);
  });

  it("does not re-render other cases while an input value is typed in", async () => {
    const user = userEvent.setup();
    renderForm([buildCase({ name: "first" }), buildCase({ name: "second" })]);

    const [firstInput] = screen.getAllByLabelText("Input 1 value");
    await user.type(firstInput, "9");

    const [, secondName] = screen.getAllByLabelText("Name");
    const key = `input:${secondName.id}`;
    const before = renderCounts.get(key);

    await user.type(firstInput, "87");

    expect(renderCounts.get(key)).toBe(before);
  });

  it("exposes a reorder handle for each case", () => {
    renderForm([buildCase({ name: "first" }), buildCase({ name: "second" })]);

    expect(screen.getByLabelText("Reorder first")).toBeVisible();
    expect(screen.getByLabelText("Reorder second")).toBeVisible();
  });

  it("saves the cases in their listed order", async () => {
    const user = userEvent.setup();
    const onSave = renderForm([
      buildCase({ name: "first" }),
      buildCase({ name: "second" }),
    ]);

    await user.click(screen.getByRole("button", { name: /Save/ }));

    expect(onSave).toHaveBeenCalledWith([
      expect.objectContaining({ name: "first" }),
      expect.objectContaining({ name: "second" }),
    ]);
  });

  it("removes the case whose remove button is pressed", async () => {
    const user = userEvent.setup();
    const onSave = renderForm([
      buildCase({ name: "first" }),
      buildCase({ name: "second" }),
    ]);

    await user.click(screen.getAllByLabelText("Remove test case")[0]);
    await user.click(screen.getByRole("button", { name: /Save/ }));

    expect(onSave).toHaveBeenCalledWith([
      expect.objectContaining({ name: "second" }),
    ]);
  });

  it("adds and removes inputs on a single case", async () => {
    const user = userEvent.setup();
    const onSave = renderForm([buildCase()]);

    await user.click(screen.getByRole("button", { name: /Add input/ }));
    await user.type(screen.getByLabelText("Input 2 value"), "5");
    await user.click(screen.getByRole("button", { name: /Save/ }));

    expect(onSave).toHaveBeenCalledWith([
      expect.objectContaining({
        inputs: [
          expect.objectContaining({ value: "1" }),
          expect.objectContaining({ value: "5" }),
        ],
      }),
    ]);
  });

  it("shapes a new case like the previous one, with empty values", async () => {
    const user = userEvent.setup();
    const onSave = renderForm([
      buildCase({
        name: "first",
        inputs: [
          { value: "1,2", valueType: "integer_array" },
          { value: "hello", valueType: "string" },
        ],
        expectedOutputValue: "yes",
        expectedOutputValueType: "boolean",
      }),
    ]);

    await user.click(screen.getByRole("button", { name: /Add test case/ }));

    expect(screen.getAllByLabelText("Input 1 value")).toHaveLength(2);
    expect(screen.getAllByLabelText("Input 2 value")).toHaveLength(2);
    expect(screen.getAllByLabelText("Input 1 value")[1]).toHaveValue("");

    await user.type(screen.getAllByLabelText("Input 1 value")[1], "3,4");
    await user.type(screen.getAllByLabelText("Input 2 value")[1], "world");
    await user.type(screen.getAllByLabelText("Expected output")[1], "no");
    await user.click(screen.getByRole("button", { name: /Save/ }));

    expect(onSave).toHaveBeenCalledWith([
      expect.anything(),
      {
        name: "",
        inputs: [
          { value: "3,4", valueType: "integer_array" },
          { value: "world", valueType: "string" },
        ],
        expectedOutputValue: "no",
        expectedOutputValueType: "boolean",
      },
    ]);
  });

  it("falls back to a single integer input when there is nothing to copy", async () => {
    const user = userEvent.setup();
    renderForm([]);

    await user.click(screen.getByRole("button", { name: /Add test case/ }));

    expect(screen.getAllByLabelText("Input 1 value")).toHaveLength(2);
    expect(screen.queryByLabelText("Input 2 value")).not.toBeInTheDocument();
  });

  it("keeps the last case from being removed", () => {
    renderForm([buildCase()]);

    expect(screen.getByLabelText("Remove test case")).toBeDisabled();
  });
});
