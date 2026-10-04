import { Suspense } from "react";
import GamesLayout from "@/views/games/games-layout";

export default function GamesPage() {
  return (
    <Suspense>
      <GamesLayout />
    </Suspense>
  );
}
