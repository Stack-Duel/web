import PlayGameContent from "@/views/game/play-game-content";

export default async function PlayGamePage({
  params,
}: Readonly<{
  params: Promise<{ gameId: string }>;
}>) {
  const gameId = (await params).gameId;

  return <PlayGameContent gameId={gameId} />;
}
