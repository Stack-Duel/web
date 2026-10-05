import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useTrackSelection } from "./use-track-selection";
import { useTracks } from "@/domains/game/api/use-tracks";
import type { Track } from "@/domains/game/models/track";

vi.mock("@/domains/game/api/use-tracks", () => ({ useTracks: vi.fn() }));

const mockedUseTracks = vi.mocked(useTracks);

const tracks: Track[] = [
  {
    id: "track-gp",
    key: "general-purpose",
    name: "General Purpose",
    allowsLanguageSelection: false,
    languages: [
      { id: "lang-js", name: "JavaScript" },
      { id: "lang-py", name: "Python" },
    ],
  },
  {
    id: "track-sql",
    key: "sql",
    name: "SQL",
    allowsLanguageSelection: false,
    languages: [{ id: "lang-sqlite", name: "SQLite" }],
  },
];

describe("useTrackSelection", () => {
  it("starts with no tracks selected", () => {
    mockedUseTracks.mockReturnValue({ data: tracks } as never);

    const { result } = renderHook(() => useTrackSelection());

    expect(result.current.selectedTracks.size).toBe(0);
  });

  it("resetToDefault selects general-purpose with all of its languages", () => {
    mockedUseTracks.mockReturnValue({ data: tracks } as never);

    const { result } = renderHook(() => useTrackSelection());
    act(() => result.current.resetToDefault());

    expect(result.current.selectedTracks).toEqual(
      new Map([["general-purpose", new Set(["lang-js", "lang-py"])]])
    );
  });

  it("resetToDefault selects nothing when general-purpose is unavailable", () => {
    mockedUseTracks.mockReturnValue({
      data: [
        {
          id: "track-sql",
          key: "sql",
          name: "SQL",
          allowsLanguageSelection: false,
          languages: [],
        },
      ] as Track[],
    } as never);

    const { result } = renderHook(() => useTrackSelection());
    act(() => result.current.resetToDefault());

    expect(result.current.selectedTracks.size).toBe(0);
  });

  it("resetToDefault called before tracks load applies the default once they arrive", async () => {
    mockedUseTracks.mockReturnValue({ data: undefined } as never);

    const { result, rerender } = renderHook(() => useTrackSelection());
    act(() => result.current.resetToDefault());

    expect(result.current.selectedTracks.size).toBe(0);

    mockedUseTracks.mockReturnValue({ data: tracks } as never);
    rerender();

    await waitFor(() =>
      expect(result.current.selectedTracks).toEqual(
        new Map([["general-purpose", new Set(["lang-js", "lang-py"])]])
      )
    );
  });

  it("does not overwrite a manual selection made after tracks were already loaded", () => {
    mockedUseTracks.mockReturnValue({ data: tracks } as never);

    const { result, rerender } = renderHook(() => useTrackSelection());
    act(() => result.current.toggleTrack("sql", true));
    rerender();

    expect(result.current.selectedTracks).toEqual(
      new Map([["sql", new Set(["lang-sqlite"])]])
    );
  });

  it("toggleTrack selects all of the track's languages, and removes them all on uncheck", () => {
    mockedUseTracks.mockReturnValue({ data: tracks } as never);

    const { result } = renderHook(() => useTrackSelection());
    act(() => result.current.toggleTrack("sql", true));

    expect(result.current.selectedTracks).toEqual(
      new Map([["sql", new Set(["lang-sqlite"])]])
    );

    act(() => result.current.toggleTrack("sql", false));

    expect(result.current.selectedTracks.size).toBe(0);
  });

  it("toggleLanguage adds and removes a single language from a track's selection", () => {
    mockedUseTracks.mockReturnValue({ data: tracks } as never);

    const { result } = renderHook(() => useTrackSelection());
    act(() => result.current.toggleTrack("general-purpose", true));
    act(() =>
      result.current.toggleLanguage("general-purpose", "lang-py", false)
    );

    expect(result.current.selectedTracks).toEqual(
      new Map([["general-purpose", new Set(["lang-js"])]])
    );
  });

  it("toggleLanguage unchecking the last language removes the track entirely", () => {
    mockedUseTracks.mockReturnValue({ data: tracks } as never);

    const { result } = renderHook(() => useTrackSelection());
    act(() => result.current.toggleTrack("sql", true));
    act(() => result.current.toggleLanguage("sql", "lang-sqlite", false));

    expect(result.current.selectedTracks.size).toBe(0);
  });
});
