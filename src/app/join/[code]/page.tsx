import JoinGameContent from "@/views/join/join-game-content";

export default async function JoinGamePage({
  params,
}: Readonly<{
  params: Promise<{ code: string }>;
}>) {
  const code = (await params).code;

  return <JoinGameContent code={code} />;
}
