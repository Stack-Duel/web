import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SetupLanguageTable from "./setup-language-table";

const languages = [
  { id: "lang_1", name: "TypeScript" },
  { id: "lang_2", name: "Python" },
];

describe("SetupLanguageTable", () => {
  it("renders a row for every language", () => {
    render(
      <SetupLanguageTable
        languages={languages}
        selectedIds={new Set()}
        onSelectedIdsChange={vi.fn()}
      />
    );

    expect(screen.getByText("TypeScript")).toBeVisible();
    expect(screen.getByText("Python")).toBeVisible();
  });

  it("adds a language to the selection when its checkbox is checked", async () => {
    const user = userEvent.setup();
    const onSelectedIdsChange = vi.fn();
    render(
      <SetupLanguageTable
        languages={languages}
        selectedIds={new Set()}
        onSelectedIdsChange={onSelectedIdsChange}
      />
    );

    await user.click(
      screen.getByRole("checkbox", { name: "Select TypeScript" })
    );

    expect(onSelectedIdsChange).toHaveBeenCalledWith(new Set(["lang_1"]));
  });

  it("removes a language from the selection when its checkbox is unchecked", async () => {
    const user = userEvent.setup();
    const onSelectedIdsChange = vi.fn();
    render(
      <SetupLanguageTable
        languages={languages}
        selectedIds={new Set(["lang_1", "lang_2"])}
        onSelectedIdsChange={onSelectedIdsChange}
      />
    );

    await user.click(
      screen.getByRole("checkbox", { name: "Select TypeScript" })
    );

    expect(onSelectedIdsChange).toHaveBeenCalledWith(new Set(["lang_2"]));
  });

  it("selects every language when the header checkbox is checked", async () => {
    const user = userEvent.setup();
    const onSelectedIdsChange = vi.fn();
    render(
      <SetupLanguageTable
        languages={languages}
        selectedIds={new Set()}
        onSelectedIdsChange={onSelectedIdsChange}
      />
    );

    await user.click(
      screen.getByRole("checkbox", { name: "Select all languages" })
    );

    expect(onSelectedIdsChange).toHaveBeenCalledWith(
      new Set(["lang_1", "lang_2"])
    );
  });

  it("clears the selection when the header checkbox is unchecked", async () => {
    const user = userEvent.setup();
    const onSelectedIdsChange = vi.fn();
    render(
      <SetupLanguageTable
        languages={languages}
        selectedIds={new Set(["lang_1", "lang_2"])}
        onSelectedIdsChange={onSelectedIdsChange}
      />
    );

    await user.click(
      screen.getByRole("checkbox", { name: "Select all languages" })
    );

    expect(onSelectedIdsChange).toHaveBeenCalledWith(new Set());
  });

  it("marks the header checkbox indeterminate when only some languages are selected", () => {
    render(
      <SetupLanguageTable
        languages={languages}
        selectedIds={new Set(["lang_1"])}
        onSelectedIdsChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole("checkbox", { name: "Select all languages" })
    ).toHaveAttribute("aria-checked", "mixed");
  });
});
