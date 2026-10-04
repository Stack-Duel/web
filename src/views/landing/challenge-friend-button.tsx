"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { routerConfig } from "@/shared/router-config";
import { SignInButton, useUser } from "@clerk/nextjs";

const CHALLENGE_TARGET = `${routerConfig.games.execute({
  mode: "duel",
})}&challenge=1`;

export default function ChallengeFriendButton() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <Button asChild size="lg" variant="secondary" className="w-40">
        <Link href={CHALLENGE_TARGET}>Challenge a friend</Link>
      </Button>
    );
  }

  return (
    <Button asChild size="lg" variant="secondary" className="w-40">
      <SignInButton mode="modal">Challenge a friend</SignInButton>
    </Button>
  );
}
