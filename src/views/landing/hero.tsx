import { Button } from "@/shared/components/ui/button";
import { BackgroundRippleEffect } from "@/shared/components/ui/background-ripple-effect";
import { routerConfig } from "@/shared/router-config";
import ChallengeFriendButton from "./challenge-friend-button";

export default function Hero() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundRippleEffect />
      <article className="relative z-10 flex flex-col gap-5 items-center text-center px-4 py-34">
        <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm shadow-lg backdrop-blur-md">
          <span
            className="size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />{" "}
          Alpha Release
        </span>
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold max-w-[25ch]">
          Stop Coding Alone
        </h1>
        <p className="text-muted-foreground max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
          Turn practicing data structures and algorithms into a battle. Go
          head-to-head with other developers, race to solve coding challenges,
          and climb the ranks to prove your skill.
        </p>
        <ul className="flex items-center gap-3">
          <li>
            <Button asChild size="lg" className="w-40">
              <a href={routerConfig.authSignUp.path}>Play Now</a>
            </Button>
          </li>
          <li>
            <ChallengeFriendButton />
          </li>
        </ul>
      </article>
    </div>
  );
}
