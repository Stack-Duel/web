"use client";

import PlayCard from "./play-card";
import { Users } from "lucide-react";
import { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { routerConfig } from "@/shared/router-config";
import { GameMode, GameModeKey } from "../models/game-mode";
import { useGameModes } from "../api/use-game-modes";

type PlayFFACardProps = ComponentProps<"div"> & {
  gameMode?: GameMode;
};

export default function PlayFFACard({
  gameMode: gameModeProp,
  ...props
}: Readonly<PlayFFACardProps>) {
  const router = useRouter();
  const { data: gameModes } = useGameModes({
    queryConfig: { enabled: !gameModeProp },
  });
  const gameMode =
    gameModeProp ?? gameModes?.find((mode) => mode.key === GameModeKey.Ffa);
  const goToLobbies = () => {
    router.push(routerConfig.games.execute({ mode: GameModeKey.Ffa }));
  };

  return (
    <PlayCard
      {...props}
      color="lime"
      icon={Users}
      header={"FFA"}
      tidbit="Free-for-all"
      disabled={!gameMode}
      description={
        "Solve as many problems as possible before the time runs out."
      }
      playerCount={`${gameMode?.minPlayers} - ${gameMode?.maxPlayers} players`}
      time={"5 / 10 / 15 / 30 minutes"}
      onClick={goToLobbies}
      type="Ranked"
    />
  );
}
