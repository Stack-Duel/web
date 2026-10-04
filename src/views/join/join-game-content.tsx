"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Swords } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routerConfig } from "@/shared/router-config";
import { useJoinGameByCode } from "@/domains/game/api/join-game-by-code";
import {
  useUserStore,
  selectIsAuthenticated,
  selectIsFullyLoaded,
} from "@/domains/user/state/user-store";

type JoinGameContentProps = {
  code: string;
};

export default function JoinGameContent({
  code,
}: Readonly<JoinGameContentProps>) {
  const router = useRouter();
  const isAuthenticated = useUserStore(selectIsAuthenticated);
  const isFullyLoaded = useUserStore(selectIsFullyLoaded);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: joinGameByCode, isPending: isJoining } = useJoinGameByCode();

  const handleJoin = () => {
    setErrorMessage(null);
    joinGameByCode(
      { joinCode: code },
      {
        onSuccess: (gameId) => {
          router.replace(routerConfig.gamePlay.execute({ gameId }));
        },
        onError: (error) => {
          const message = error.message || "This invite is no longer valid.";
          setErrorMessage(message);
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Swords className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">
            You&apos;ve been invited to a duel!
          </CardTitle>
          <CardDescription>Code: {code}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-3">
          {!isFullyLoaded ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : isAuthenticated ? (
            <>
              <Button
                className="w-full"
                onClick={handleJoin}
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Join Game"}
              </Button>
              {errorMessage ? (
                <p className="text-center text-sm text-destructive">
                  {errorMessage}
                </p>
              ) : null}
            </>
          ) : (
            <Button asChild className="w-full">
              <a
                href={`${
                  routerConfig.authLogIn.path
                }?returnTo=${encodeURIComponent(
                  routerConfig.joinGame.execute({ code })
                )}`}
              >
                Sign in to join
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
