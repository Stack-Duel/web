import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenerationParametersForm from "./generation-parameters-form";
import type { GenerationParameter } from "../models/generation-parameters";

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
      const key = `input:${props.id ?? "unknown"}`;
      renderCounts.set(key, (renderCounts.get(key) ?? 0) + 1);
      return <actual.Input {...props} />;
    },
  };
});

function buildParameter(
  overrides: Partial<GenerationParameter> = {}
): GenerationParameter {
  return {
    name: "nums",
    valueType: "integer",
    min: 0,
    max: 100,
    lengthMin: null,
    lengthMax: null,
    charset: null,
    ...overrides,
  };
}

function renderForm(parameters: GenerationParameter[], onSave = vi.fn()) {
  render(
    <GenerationParametersForm
      initialParameters={parameters}
      initialOutputValueType="integer"
      initialTargetCaseCount={20}
      initialSeed={1}
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

describe("GenerationParametersForm", () => {
  it("shows only range constraints for an integer", () => {
    renderForm([buildParameter()]);

    expect(screen.getByLabelText("Min")).toBeVisible();
    expect(screen.getByLabelText("Max")).toBeVisible();
    expect(screen.queryByLabelText("Length min")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Charset")).not.toBeInTheDocument();
  });

  it("shows length and charset for a string, not range", () => {
    renderForm([buildParameter({ valueType: "string" })]);

    expect(screen.getByLabelText("Length min")).toBeVisible();
    expect(screen.getByLabelText("Length max")).toBeVisible();
    expect(screen.getByLabelText("Charset")).toBeVisible();
    expect(screen.queryByLabelText("Min")).not.toBeInTheDocument();
  });

  it("shows both range and length for an integer array", () => {
    renderForm([buildParameter({ valueType: "integer_array" })]);

    expect(screen.getByLabelText("Min")).toBeVisible();
    expect(screen.getByLabelText("Length max")).toBeVisible();
    expect(screen.queryByLabelText("Charset")).not.toBeInTheDocument();
  });

  it("says a boolean takes no constraints", () => {
    renderForm([buildParameter({ valueType: "boolean" })]);

    expect(
      screen.getByText("boolean takes no range or length constraints.")
    ).toBeVisible();
    expect(screen.queryByLabelText("Min")).not.toBeInTheDocument();
  });

  it("drops constraints that the new type does not support", async () => {
    const user = userEvent.setup();
    const onSave = renderForm([buildParameter()]);

    await user.click(screen.getByLabelText("Type"));
    await user.click(await screen.findByRole("option", { name: "string" }));
    await user.click(screen.getByRole("button", { name: /Save/ }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        parameters: [expect.objectContaining({ min: null, max: null })],
      })
    );
  });

  it("does not re-render other parameter rows while one is typed in", async () => {
    const user = userEvent.setup();
    renderForm([
      buildParameter({ name: "nums" }),
      buildParameter({ name: "target" }),
    ]);

    const [firstName] = screen.getAllByLabelText("Name");
    await user.type(firstName, "X");

    const secondNameKey = Array.from(renderCounts.keys()).find(
      (key) =>
        key.startsWith("input:param-name-") && !key.endsWith(firstName.id)
    );
    const before = renderCounts.get(secondNameKey!);

    await user.type(firstName, "YZ");

    expect(renderCounts.get(secondNameKey!)).toBe(before);
  });

  it("exposes a reorder handle for each parameter", () => {
    renderForm([
      buildParameter({ name: "nums" }),
      buildParameter({ name: "target" }),
    ]);

    expect(screen.getByLabelText("Reorder nums")).toBeVisible();
    expect(screen.getByLabelText("Reorder target")).toBeVisible();
  });

  it("saves parameters in their listed order", async () => {
    const user = userEvent.setup();
    const onSave = renderForm([
      buildParameter({ name: "nums" }),
      buildParameter({ name: "target" }),
    ]);

    await user.click(screen.getByRole("button", { name: /Save/ }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        parameters: [
          expect.objectContaining({ name: "nums" }),
          expect.objectContaining({ name: "target" }),
        ],
      })
    );
  });

  it("removes the parameter whose remove button is pressed", async () => {
    const user = userEvent.setup();
    const onSave = renderForm([
      buildParameter({ name: "nums" }),
      buildParameter({ name: "target" }),
    ]);

    const rows = screen.getAllByLabelText("Remove parameter");
    await user.click(rows[0]);
    await user.click(screen.getByRole("button", { name: /Save/ }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        parameters: [expect.objectContaining({ name: "target" })],
      })
    );
  });

  it("keeps the last parameter from being removed", () => {
    renderForm([buildParameter()]);

    expect(screen.getByLabelText("Remove parameter")).toBeDisabled();
  });
});
