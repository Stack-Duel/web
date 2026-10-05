"use client";

import { useEffect, useRef, useState } from "react";
import { useTracks } from "@/domains/game/api/use-tracks";
import type { Track } from "@/domains/game/models/track";

const DEFAULT_TRACK_KEY = "general-purpose";

export type TrackSelectionMap = Map<string, Set<string>>;

function defaultSelection(tracks: Track[] | undefined): TrackSelectionMap {
  const defaultTrack = tracks?.find((track) => track.key === DEFAULT_TRACK_KEY);
  return defaultTrack
    ? new Map([
        [
          defaultTrack.key,
          new Set(defaultTrack.languages.map((language) => language.id)),
        ],
      ])
    : new Map();
}

export function useTrackSelection(options?: { enabled?: boolean }) {
  const { data: tracks } = useTracks({
    queryConfig: { enabled: options?.enabled },
  });
  const [selectedTracks, setSelectedTracks] = useState<TrackSelectionMap>(
    new Map()
  );
  // resetToDefault can be called (e.g. on dialog open) before `tracks` has
  // finished loading — enabling the query and its first successful fetch
  // are never in the same render, so reading `tracks` synchronously at that
  // point is always stale. Defer the reset until tracks actually arrive
  // instead of silently resetting to an empty selection.
  const pendingResetRef = useRef(false);

  const resetToDefault = () => {
    if (tracks) {
      setSelectedTracks(defaultSelection(tracks));
      pendingResetRef.current = false;
    } else {
      pendingResetRef.current = true;
    }
  };

  useEffect(() => {
    if (tracks && pendingResetRef.current) {
      setSelectedTracks(defaultSelection(tracks));
      pendingResetRef.current = false;
    }
  }, [tracks]);

  const toggleTrack = (trackKey: string, checked: boolean) => {
    setSelectedTracks((prev) => {
      const next = new Map(prev);
      if (checked) {
        const track = tracks?.find((t) => t.key === trackKey);
        next.set(
          trackKey,
          new Set(track?.languages.map((language) => language.id) ?? [])
        );
      } else {
        next.delete(trackKey);
      }
      return next;
    });
  };

  const toggleLanguage = (
    trackKey: string,
    languageId: string,
    checked: boolean
  ) => {
    setSelectedTracks((prev) => {
      const next = new Map(prev);
      const current = new Set(next.get(trackKey));

      if (checked) {
        current.add(languageId);
      } else {
        current.delete(languageId);
      }

      if (current.size === 0) {
        next.delete(trackKey);
      } else {
        next.set(trackKey, current);
      }

      return next;
    });
  };

  return {
    tracks,
    selectedTracks,
    resetToDefault,
    toggleTrack,
    toggleLanguage,
  };
}
