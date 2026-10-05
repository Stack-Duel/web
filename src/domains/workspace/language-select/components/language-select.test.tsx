import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSelect } from "./language-select";
import type { ProgrammingLanguage } from "@/domains/language/models/programming-language";

const languages: ProgrammingLanguage[] = [
  {
    id: "python",
    name: "Python",
    versions: [
      { id: "python-3.11", version: "3.11" },
      { id: "python-3.12", version: "3.12" },
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    versions: [{ id: "js-20", version: "20" }],
  },
];

describe("LanguageSelect", () => {
  it("auto-selects the first version of the first preferred language when nothing is selected", () => {
    const onSelectVersion = vi.fn();

    render(
      <LanguageSelect
        languages={languages}
        selectedVersionId={null}
        onSelectVersion={onSelectVersion}
        preferredLanguageIds={["javascript", "python"]}
      />
    );

    expect(onSelectVersion).toHaveBeenCalledWith("js-20");
  });

  it("falls back to the first language's first version with no preferred languages", () => {
    const onSelectVersion = vi.fn();

    render(
      <LanguageSelect
        languages={languages}
        selectedVersionId={null}
        onSelectVersion={onSelectVersion}
      />
    );

    expect(onSelectVersion).toHaveBeenCalledWith("python-3.11");
  });

  it("does not call onSelectVersion again when the current selection is already valid", () => {
    const onSelectVersion = vi.fn();

    render(
      <LanguageSelect
        languages={languages}
        selectedVersionId="python-3.12"
        onSelectVersion={onSelectVersion}
      />
    );

    expect(onSelectVersion).not.toHaveBeenCalled();
  });

  it("re-selects a default version when the current selection is not valid for these languages", () => {
    const onSelectVersion = vi.fn();

    render(
      <LanguageSelect
        languages={languages}
        selectedVersionId="ruby-3"
        onSelectVersion={onSelectVersion}
      />
    );

    expect(onSelectVersion).toHaveBeenCalledWith("python-3.11");
  });

  it("selects the new language's first version when switching languages", async () => {
    const onSelectVersion = vi.fn();
    const user = userEvent.setup();

    render(
      <LanguageSelect
        languages={languages}
        selectedVersionId="python-3.11"
        onSelectVersion={onSelectVersion}
      />
    );

    const [languageCombobox] = screen.getAllByRole("combobox");
    await user.click(languageCombobox);
    await user.click(await screen.findByRole("option", { name: "JavaScript" }));

    expect(onSelectVersion).toHaveBeenCalledWith("js-20");
  });

  it("selects a specific version from the version dropdown", async () => {
    const onSelectVersion = vi.fn();
    const user = userEvent.setup();

    render(
      <LanguageSelect
        languages={languages}
        selectedVersionId="python-3.11"
        onSelectVersion={onSelectVersion}
      />
    );

    const [, versionCombobox] = screen.getAllByRole("combobox");
    await user.click(versionCombobox);
    await user.click(await screen.findByRole("option", { name: "3.12" }));

    expect(onSelectVersion).toHaveBeenCalledWith("python-3.12");
  });

  it("disables both selects when there are no languages", () => {
    render(
      <LanguageSelect
        languages={[]}
        selectedVersionId={null}
        onSelectVersion={vi.fn()}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes).toHaveLength(2);
    for (const combobox of comboboxes) {
      expect(combobox).toBeDisabled();
    }
  });
});
