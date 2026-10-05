"use client";

import PlayCard from "@/domains/game/components/play-card";
import { Zap } from "lucide-react";
import { ComponentProps, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useGameModes } from "@/domains/game/api/use-game-modes";
import { useCreateGameAndPlay } from "@/domains/game/hooks/use-create-game-and-play";
import { useTrackSelection } from "@/domains/game/hooks/use-track-selection";
import TrackCheckboxList from "@/domains/game/components/track-checkbox-list";
import { GameMode, GameModeKey } from "../models/game-mode";

function formatDuration(durationSeconds: number) {
  const durationMinutes = durationSeconds / 60;
  return `${durationMinutes} minute${durationMinutes === 1 ? "" : "s"}`;
}

function formatDurationValue(durationSeconds: number) {
  return durationSeconds / 60;
}

type PlaySoloRushCardProps = ComponentProps<"div"> & {
  gameMode?: GameMode;
};

export default function PlaySoloRushCard({
  gameMode: gameModeProp,
  ...props
}: Readonly<PlaySoloRushCardProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>();
  const {
    tracks,
    selectedTracks,
    resetToDefault,
    toggleTrack,
    toggleLanguage,
  } = useTrackSelection({ enabled: isDialogOpen });
  const { data: gameModes } = useGameModes({
    queryConfig: { enabled: !gameModeProp },
  });
  const gameMode =
    gameModeProp ??
    gameModes?.find((mode) => mode.key === GameModeKey.SoloRush);
  const { createGame, isCreating } = useCreateGameAndPlay();
  const timeOptions = gameMode?.timeOptions ?? [];
  const defaultTimeOption = timeOptions.find((option) => option.isDefault);
  const defaultDuration = defaultTimeOption?.durationSeconds.toString();
  const effectiveSelectedDuration = selectedDuration ?? defaultDuration;
  const timeSummary = timeOptions.map((option) =>
    formatDurationValue(option.durationSeconds)
  );

  const handleOpenChange = (open: boolean) => {
    if (open) {
      resetToDefault();
    }
    setIsDialogOpen(open);
  };

  const handleStart = async () => {
    if (!gameMode) {
      toast.error("Solo Rush game mode is not available.");
      return;
    }

    if (!effectiveSelectedDuration) {
      toast.error("Choose a time limit to start Solo Rush.");
      return;
    }

    if (selectedTracks.size === 0) {
      toast.error("Choose at least one tech stack to start Solo Rush.");
      return;
    }

    createGame({
      gameModeKey: gameMode.key,
      timeLimitInSeconds: Number(effectiveSelectedDuration),
      trackSelections: [...selectedTracks].map(([trackKey, languageIds]) => ({
        trackKey,
        languageIds: [...languageIds],
      })),
    });
  };

  return (
    <>
      <PlayCard
        {...props}
        color="lime"
        icon={Zap}
        header={"Solo Rush"}
        tidbit="Race the clock"
        description={
          "Solve as many problems as possible before the time runs out."
        }
        playerCount="1 player"
        time={
          timeSummary.length
            ? `${timeSummary.join(" / ")} minutes`
            : "No time limits available"
        }
        type="Ranked"
        disabled={!gameMode}
        onClick={() => {
          handleOpenChange(true);
        }}
      />
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose your time limit</DialogTitle>
            <DialogDescription>
              Solo Rush is a time-based game mode where you try to solve as many
              problems as possible before the time runs out. Choose your time
              limit below to start playing.
            </DialogDescription>
          </DialogHeader>
          <Select
            value={effectiveSelectedDuration ?? ""}
            onValueChange={setSelectedDuration}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a time limit" />
            </SelectTrigger>
            <SelectContent position="popper">
              {timeOptions.map((option) => (
                <SelectItem
                  key={option.durationSeconds}
                  value={option.durationSeconds.toString()}
                >
                  {formatDuration(option.durationSeconds)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TrackCheckboxList
            tracks={tracks}
            selectedTracks={selectedTracks}
            onToggleTrack={toggleTrack}
            onToggleLanguage={toggleLanguage}
            idPrefix="solo-rush-track"
          />
          <Button type="button" onClick={handleStart} disabled={isCreating}>
            {isCreating ? "Starting..." : "Start game"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
