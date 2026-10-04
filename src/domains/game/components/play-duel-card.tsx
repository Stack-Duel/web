"use client";

import PlayCard from "./play-card";
import { Swords } from "lucide-react";
import { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { routerConfig } from "@/shared/router-config";
import { GameMode, GameModeKey } from "../models/game-mode";
import { useGameModes } from "../api/use-game-modes";

type PlayDuelCardProps = ComponentProps<"div"> & {
  gameMode?: GameMode;
};

export default function PlayDuelCard({
  gameMode: gameModeProp,
  ...props
}: Readonly<PlayDuelCardProps>) {
  const router = useRouter();
  const { data: gameModes } = useGameModes({
    queryConfig: { enabled: !gameModeProp },
  });
  const gameMode =
    gameModeProp ?? gameModes?.find((mode) => mode.key === GameModeKey.Duel);

  const goToLobbies = () => {
    router.push(routerConfig.games.execute({ mode: GameModeKey.Duel }));
  };

  return (
    <PlayCard
      {...props}
      color="sky"
      icon={Swords}
      header={"Duel"}
      tidbit="Head-to-head battle"
      disabled={!gameMode}
      description={"Challenge your opponent in a one-on-one duel."}
      playerCount="2 players"
      time={"5 / 10 / 15 minutes"}
      onClick={goToLobbies}
      type="Ranked"
    />
  );
}
