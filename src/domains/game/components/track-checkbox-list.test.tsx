import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TrackCheckboxList from "./track-checkbox-list";
import type { Track } from "@/domains/game/models/track";

const tracks: Track[] = [
  {
    id: "track-frontend",
    key: "frontend",
    name: "Frontend",
    allowsLanguageSelection: true,
    languages: [
      { id: "lang-js", name: "JavaScript" },
      { id: "lang-py", name: "Python" },
    ],
  },
  {
    id: "track-gp",
    key: "general-purpose",
    name: "General Purpose",
    allowsLanguageSelection: false,
    languages: [
      { id: "lang-a", name: "Lang A" },
      { id: "lang-b", name: "Lang B" },
    ],
  },
  {
    id: "track-sql",
    key: "sql",
    name: "SQL",
    allowsLanguageSelection: false,
    languages: [{ id: "lang-sqlite", name: "SQLite" }],
  },
  {
    id: "track-mobile",
    key: "mobile",
    name: "Mobile",
    allowsLanguageSelection: true,
    languages: [{ id: "lang-swift", name: "Swift" }],
  },
  {
    id: "track-empty",
    key: "empty",
    name: "Empty Track",
    allowsLanguageSelection: true,
    languages: [],
  },
];

describe("TrackCheckboxList", () => {
  it("renders a checkbox and label for each track", () => {
    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={new Map()}
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );

    expect(screen.getByLabelText("Frontend")).toBeInTheDocument();
    expect(screen.getByLabelText("SQL")).toBeInTheDocument();
  });

  it("checks the box for a selected track", () => {
    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={new Map([["sql", new Set<string>(["lang-sqlite"])]])}
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );

    expect(screen.getByLabelText("Frontend")).not.toBeChecked();
    expect(screen.getByLabelText("SQL")).toBeChecked();
  });

  it("calls onToggleTrack with the track key and next checked state", async () => {
    const onToggleTrack = vi.fn();
    const user = userEvent.setup();

    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={new Map()}
        onToggleTrack={onToggleTrack}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );
    await user.click(screen.getByLabelText("SQL"));

    expect(onToggleTrack).toHaveBeenCalledWith("sql", true);
  });

  it("renders nothing when tracks is undefined", () => {
    render(
      <TrackCheckboxList
        tracks={undefined}
        selectedTracks={new Map()}
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("shows a language checkbox per language once its track is checked", () => {
    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={
          new Map([["frontend", new Set(["lang-js", "lang-py"])]])
        }
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );

    expect(screen.getByLabelText("JavaScript")).toBeInTheDocument();
    expect(screen.getByLabelText("Python")).toBeInTheDocument();
  });

  it("does not show language checkboxes when the track is unchecked", () => {
    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={new Map()}
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );

    expect(screen.queryByLabelText("JavaScript")).not.toBeInTheDocument();
  });

  it("checks only the selected languages under a partially-selected track", () => {
    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={new Map([["frontend", new Set(["lang-js"])]])}
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );

    expect(screen.getByLabelText("JavaScript")).toBeChecked();
    expect(screen.getByLabelText("Python")).not.toBeChecked();
  });

  it("calls onToggleLanguage with the track key, language id, and next checked state", async () => {
    const onToggleLanguage = vi.fn();
    const user = userEvent.setup();

    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={new Map([["frontend", new Set(["lang-js"])]])}
        onToggleTrack={vi.fn()}
        onToggleLanguage={onToggleLanguage}
        idPrefix="track"
      />
    );
    await user.click(screen.getByLabelText("Python"));

    expect(onToggleLanguage).toHaveBeenCalledWith("frontend", "lang-py", true);
  });

  it("does not show a collapse toggle or language rows for a track with no languages", () => {
    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={new Map([["empty", new Set<string>()]])}
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );

    expect(
      screen.queryByRole("button", { name: /Empty Track languages/ })
    ).not.toBeInTheDocument();
  });

  it("collapses the language list when the toggle is clicked", async () => {
    const user = userEvent.setup();

    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={
          new Map([["frontend", new Set(["lang-js", "lang-py"])]])
        }
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );
    expect(screen.getByLabelText("JavaScript")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Collapse Frontend languages" })
    );

    expect(screen.queryByLabelText("JavaScript")).not.toBeInTheDocument();
  });

  it("re-expands a collapsed language list when the toggle is clicked again", async () => {
    const user = userEvent.setup();

    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={
          new Map([["frontend", new Set(["lang-js", "lang-py"])]])
        }
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Collapse Frontend languages" })
    );
    await user.click(
      screen.getByRole("button", { name: "Expand Frontend languages" })
    );

    expect(screen.getByLabelText("JavaScript")).toBeInTheDocument();
  });

  it("shows every language as checked and disabled, without a collapse toggle, when allowsLanguageSelection is false", () => {
    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={
          new Map([["general-purpose", new Set(["lang-a", "lang-b"])]])
        }
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );

    expect(
      screen.queryByRole("button", { name: /General Purpose languages/ })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Lang A")).toBeChecked();
    expect(screen.getByLabelText("Lang A")).toBeDisabled();
    expect(screen.getByLabelText("Lang B")).toBeChecked();
    expect(screen.getByLabelText("Lang B")).toBeDisabled();
  });

  it("still lets a track with allowsLanguageSelection false be checked and unchecked", async () => {
    const onToggleTrack = vi.fn();
    const user = userEvent.setup();

    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={new Map()}
        onToggleTrack={onToggleTrack}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );
    await user.click(screen.getByLabelText("General Purpose"));

    expect(onToggleTrack).toHaveBeenCalledWith("general-purpose", true);
  });

  it("shows a single language as checked and disabled, without a collapse toggle, even when allowsLanguageSelection is true", () => {
    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={new Map([["mobile", new Set(["lang-swift"])]])}
        onToggleTrack={vi.fn()}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );

    expect(
      screen.queryByRole("button", { name: /Mobile languages/ })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Swift")).toBeChecked();
    expect(screen.getByLabelText("Swift")).toBeDisabled();
  });

  it("still lets a single-language track be checked and unchecked via its own checkbox", async () => {
    const onToggleTrack = vi.fn();
    const user = userEvent.setup();

    render(
      <TrackCheckboxList
        tracks={tracks}
        selectedTracks={new Map([["mobile", new Set(["lang-swift"])]])}
        onToggleTrack={onToggleTrack}
        onToggleLanguage={vi.fn()}
        idPrefix="track"
      />
    );
    await user.click(screen.getByLabelText("Mobile"));

    expect(onToggleTrack).toHaveBeenCalledWith("mobile", false);
  });
});
