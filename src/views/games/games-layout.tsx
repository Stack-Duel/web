"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import GamesTable from "@/domains/game/tables/games-table";
import MyActiveGamesTable from "@/domains/game/tables/my-active-games-table";
import CreateGameDialog from "@/domains/game/components/create-game-dialog";
import JoinByCodeDialog from "@/domains/game/components/join-by-code-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { routerConfig } from "@/shared/router-config";
import { GameModeKey } from "@/domains/game/models/game-mode";
import { Card, CardContent } from "@/shared/components/ui/card";

const PlaySoloRushCard = dynamic(
  () => import("@/domains/game/components/play-solo-rush-card"),
  { ssr: false }
);

const ALL_MODES = "all";

export default function GamesLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? ALL_MODES;
  const [challengeIntent] = useState(
    () => searchParams.get("challenge") === "1"
  );

  useEffect(() => {
    if (!challengeIntent) return;

    const params = new URLSearchParams(searchParams);
    params.delete("challenge");
    const query = params.toString();
    router.replace(
      query ? `${routerConfig.games.path}?${query}` : routerConfig.games.path,
      {
        scroll: false,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onModeChange = (value: string) => {
    router.push(
      routerConfig.games.execute({
        mode: value === ALL_MODES ? undefined : value,
      })
    );
  };

  return (
    <SidebarLayout breadcrumbs={[]}>
      <div className="@container flex flex-col gap-4 px-2 pb-2 md:px-4 md:pb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Games</h3>
          <p className="text-muted-foreground">
            Join an open lobby or create your own.
          </p>
        </div>

        <PlaySoloRushCard />

        <MyActiveGamesTable />

        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Select value={mode} onValueChange={onModeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All modes" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value={ALL_MODES}>All modes</SelectItem>
                  <SelectItem value={GameModeKey.Duel}>Duel</SelectItem>
                  <SelectItem value={GameModeKey.Ffa}>FFA</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <JoinByCodeDialog />
                <CreateGameDialog
                  defaultModeKey={
                    challengeIntent
                      ? GameModeKey.Duel
                      : mode === ALL_MODES
                        ? undefined
                        : mode
                  }
                  autoOpen={challengeIntent}
                />
              </div>
            </div>

            <GamesTable />
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
