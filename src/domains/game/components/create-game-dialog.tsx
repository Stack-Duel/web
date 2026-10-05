"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { routerConfig } from "@/shared/router-config";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useGameModes } from "@/domains/game/api/use-game-modes";
import { useCreateGame } from "@/domains/game/api/create-game";
import { useTrackSelection } from "@/domains/game/hooks/use-track-selection";
import TrackCheckboxList from "@/domains/game/components/track-checkbox-list";
import {
  useUserStore,
  selectIsAuthenticated,
} from "@/domains/user/state/user-store";
import { GameModeKey } from "../models/game-mode";

function formatDuration(durationSeconds: number) {
  const durationMinutes = durationSeconds / 60;
  return `${durationMinutes} minute${durationMinutes === 1 ? "" : "s"}`;
}

type CreateGameDialogProps = {
  defaultModeKey?: string;
  autoOpen?: boolean;
};

export default function CreateGameDialog({
  defaultModeKey,
  autoOpen = false,
}: Readonly<CreateGameDialogProps>) {
  const router = useRouter();
  const isAuthenticated = useUserStore(selectIsAuthenticated);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedModeKey, setSelectedModeKey] = useState<string | undefined>(
    defaultModeKey
  );
  const [selectedDuration, setSelectedDuration] = useState<string>();
  const [skipsEnabled, setSkipsEnabled] = useState(true);
  const {
    tracks,
    selectedTracks,
    resetToDefault,
    toggleTrack,
    toggleLanguage,
  } = useTrackSelection();

  const { data: gameModes } = useGameModes();
  const joinableModes = (gameModes ?? []).filter(
    (mode) => mode.key !== GameModeKey.SoloRush
  );

  const selectedMode = joinableModes.find(
    (mode) => mode.key === selectedModeKey
  );
  const defaultTimeOption = selectedMode?.timeOptions.find((o) => o.isDefault);
  const defaultDuration = defaultTimeOption?.durationSeconds.toString();
  const effectiveSelectedDuration = selectedDuration ?? defaultDuration;

  const { mutate: createGame, isPending: isCreating } = useCreateGame();

  const onSelectMode = (modeKey: string) => {
    setSelectedModeKey(modeKey);
    setSelectedDuration(undefined);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      resetToDefault();
      setSkipsEnabled(true);
    }
    setIsDialogOpen(open);
  };

  useEffect(() => {
    if (autoOpen && isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleOpenChange(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen, isAuthenticated]);

  const handleCreate = () => {
    if (!selectedMode || !effectiveSelectedDuration) {
      toast.error("Choose a mode and time limit to create a game.");
      return;
    }

    if (selectedTracks.size === 0) {
      toast.error("Choose at least one tech stack to create a game.");
      return;
    }

    createGame(
      {
        gameModeKey: selectedMode.key,
        timeLimitInSeconds: Number(effectiveSelectedDuration),
        trackSelections: [...selectedTracks].map(([trackKey, languageIds]) => ({
          trackKey,
          languageIds: [...languageIds],
        })),
        skipsEnabled,
      },
      {
        onSuccess: (gameId) => {
          setIsDialogOpen(false);
          setSelectedDuration(undefined);
          router.push(routerConfig.gamePlay.execute({ gameId }));
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create game");
        },
      }
    );
  };

  return (
    <>
      <Button
        className="gap-2"
        disabled={!isAuthenticated}
        title={isAuthenticated ? undefined : "Sign in to create a game"}
        onClick={() => handleOpenChange(true)}
      >
        <Plus size={16} /> Create Game
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a game</DialogTitle>
            <DialogDescription>
              Choose a mode and time limit. Your game will appear in the list
              for others to join.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Select value={selectedModeKey ?? ""} onValueChange={onSelectMode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a mode" />
              </SelectTrigger>
              <SelectContent position="popper">
                {joinableModes.map((mode) => (
                  <SelectItem key={mode.id} value={mode.key}>
                    {mode.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={effectiveSelectedDuration ?? ""}
              onValueChange={setSelectedDuration}
              disabled={!selectedMode}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a time limit" />
              </SelectTrigger>
              <SelectContent position="popper">
                {(selectedMode?.timeOptions ?? []).map((option) => (
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
              idPrefix="track"
            />

            <div className="flex items-center gap-2">
              <Checkbox
                id="skips-enabled"
                checked={skipsEnabled}
                onCheckedChange={(checked) => setSkipsEnabled(checked === true)}
              />
              <Label htmlFor="skips-enabled">Allow skips (3 per player)</Label>
            </div>
          </div>

          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create game"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
