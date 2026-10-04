"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import LeaderboardTable from "@/domains/leaderboard/tables/leaderboard-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useGameModes } from "@/domains/game/api/use-game-modes";
import { GameModeKey } from "@/domains/game/models/game-mode";
import { routerConfig } from "@/shared/router-config";

function formatDuration(durationSeconds: number) {
  const durationMinutes = durationSeconds / 60;
  return `${durationMinutes} minute${durationMinutes === 1 ? "" : "s"}`;
}

export default function LeaderboardsLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeKey =
    (searchParams.get("mode") as GameModeKey | null) ?? GameModeKey.SoloRush;
  const [selectedDuration, setSelectedDuration] = useState<string>();

  const { data: gameModes } = useGameModes();
  const modes = gameModes ?? [];
  const selectedMode = modes.find((mode) => mode.key === modeKey);
  const defaultTimeOption = selectedMode?.timeOptions.find((o) => o.isDefault);
  const effectiveDuration =
    selectedDuration ?? defaultTimeOption?.durationSeconds.toString();

  const onModeChange = (value: string) => {
    setSelectedDuration(undefined);
    router.push(routerConfig.leaderboards.execute({ mode: value }));
  };

  return (
    <SidebarLayout breadcrumbs={[]}>
      <div className="@container flex flex-col gap-4 px-2 pb-2 md:px-4 md:pb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Leaderboards</h3>
          <p className="text-muted-foreground">
            See how you stack up against other players.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={modeKey} onValueChange={onModeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Choose a mode" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {modes.map((mode) => (
                    <SelectItem key={mode.id} value={mode.key}>
                      {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={effectiveDuration ?? ""}
                onValueChange={setSelectedDuration}
                disabled={!selectedMode}
              >
                <SelectTrigger className="w-40">
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
            </div>

            {selectedMode && effectiveDuration ? (
              <LeaderboardTable
                gameModeKey={selectedMode.key}
                timeLimitInSeconds={Number(effectiveDuration)}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
