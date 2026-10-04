"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import type { Track } from "@/domains/game/models/track";

type TrackCheckboxListProps = {
  tracks: Track[] | undefined;
  selectedTracks: Map<string, Set<string>>;
  onToggleTrack: (trackKey: string, checked: boolean) => void;
  onToggleLanguage: (
    trackKey: string,
    languageId: string,
    checked: boolean
  ) => void;
  idPrefix: string;
};

export default function TrackCheckboxList({
  tracks,
  selectedTracks,
  onToggleTrack,
  onToggleLanguage,
  idPrefix,
}: Readonly<TrackCheckboxListProps>) {
  const [closedTrackKeys, setClosedTrackKeys] = useState<Set<string>>(
    new Set()
  );

  const setTrackOpen = (trackKey: string, open: boolean) => {
    setClosedTrackKeys((prev) => {
      const next = new Set(prev);
      if (open) {
        next.delete(trackKey);
      } else {
        next.add(trackKey);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {(tracks ?? []).map((track) => {
        const selectedLanguageIds = selectedTracks.get(track.key);
        const isChecked = selectedLanguageIds !== undefined;
        const hasLanguages = track.languages.length > 0;
        const languagesAreEditable =
          track.allowsLanguageSelection && track.languages.length > 1;
        const isIndeterminate =
          isChecked &&
          languagesAreEditable &&
          (selectedLanguageIds?.size ?? 0) < track.languages.length;
        const showLanguages = isChecked && hasLanguages;
        const showChevron = showLanguages && languagesAreEditable;
        const isOpen = showChevron && !closedTrackKeys.has(track.key);

        const trackRow = (
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${idPrefix}-${track.id}`}
              checked={isIndeterminate ? "indeterminate" : isChecked}
              onCheckedChange={(checked) =>
                onToggleTrack(track.key, checked === true)
              }
            />
            <Label htmlFor={`${idPrefix}-${track.id}`}>{track.name}</Label>

            {showChevron && (
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${track.name} languages`}
                  className="text-muted-foreground transition-transform data-[state=open]:rotate-90"
                >
                  <ChevronRight className="size-4" />
                </button>
              </CollapsibleTrigger>
            )}
          </div>
        );

        if (!showLanguages) {
          return <div key={track.id}>{trackRow}</div>;
        }

        const languageRows = track.languages.map((language) => (
          <div key={language.id} className="flex items-center gap-2">
            <Checkbox
              id={`${idPrefix}-${track.id}-${language.id}`}
              checked={
                languagesAreEditable
                  ? (selectedLanguageIds?.has(language.id) ?? false)
                  : true
              }
              disabled={!languagesAreEditable}
              onCheckedChange={
                languagesAreEditable
                  ? (checked) =>
                      onToggleLanguage(track.key, language.id, checked === true)
                  : undefined
              }
            />
            <Label
              htmlFor={`${idPrefix}-${track.id}-${language.id}`}
              className="text-muted-foreground text-sm"
            >
              {language.name}
            </Label>
          </div>
        ));

        if (!languagesAreEditable) {
          return (
            <div key={track.id}>
              {trackRow}
              <div className="ml-6 flex flex-col gap-2 pt-2">
                {languageRows}
              </div>
            </div>
          );
        }

        return (
          <Collapsible
            key={track.id}
            open={isOpen}
            onOpenChange={(open) => setTrackOpen(track.key, open)}
          >
            {trackRow}

            <CollapsibleContent className="ml-6 flex flex-col gap-2 pt-2">
              {languageRows}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
