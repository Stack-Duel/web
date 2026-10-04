"use client";

import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import { Button } from "@/shared/components/ui/button";

import { useGameSession } from "@/domains/game/hooks/use-game-session";
import { gameWorkspaceRegistry } from "@/domains/game/game-workspace-registry";
import { GameStatus } from "@/domains/game/models/game";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";

type PlayGameContentProps = {
  gameId: string;
};

export default function PlayGameContent({
  gameId,
}: Readonly<PlayGameContentProps>) {
  const {
    game: currentGame,
    isLoading,
    error,
    refetch,
  } = useGameSession(gameId);
  const user = useUserStore(selectUser);

  const handleRetry = () => {
    void refetch();
  };

  const strategy = currentGame
    ? gameWorkspaceRegistry[currentGame.gameModeKey]
    : undefined;
  const Workspace = strategy?.Workspace;
  const Header = strategy?.Header;
  const GameOverSummary = strategy?.GameOverSummary;

  const ownParticipant = currentGame?.participants.find(
    (p) => p.userId === user?.id
  );
  const isGameOver =
    currentGame?.status === GameStatus.Completed ||
    currentGame?.status === GameStatus.Cancelled ||
    ownParticipant?.hasForfeited === true ||
    ownParticipant?.hasFinishedProblems === true;

  return (
    <SidebarLayout
      breadcrumbs={[]}
      headerItems={
        Header && currentGame && !isGameOver ? (
          <Header game={currentGame} />
        ) : undefined
      }
      headerClassName="pb-0"
    >
      <div className="h-full px-2 md:px-4 pb-2 md:pb-4">
        {isLoading && <div>Loading game...</div>}
        {error && (
          <div className="flex flex-col items-start gap-3">
            <div>{error}</div>
            <Button onClick={handleRetry}>Retry</Button>
          </div>
        )}
        {!isLoading &&
          !error &&
          currentGame &&
          isGameOver &&
          GameOverSummary && <GameOverSummary game={currentGame} />}
        {!isLoading && !error && currentGame && !isGameOver && Workspace && (
          <Workspace game={currentGame} />
        )}
        {!isLoading &&
          !error &&
          currentGame &&
          ((!isGameOver && !Workspace) || (isGameOver && !GameOverSummary)) && (
            <div className="text-sm text-muted-foreground">
              This game mode isn&apos;t supported yet.
            </div>
          )}
      </div>
    </SidebarLayout>
  );
}
