import type { Icon } from "@phosphor-icons/react";
import {
  GearSix,
  Sword,
  Timer,
  Flag,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";

export type HowItWorksStep = {
  icon: Icon;
  title: string;
  description: string;
};

export const howItWorksSteps: HowItWorksStep[] = [
  {
    icon: GearSix,
    title: "Create a lobby",
    description:
      "Select your tech stack and set up a lobby for the match ahead.",
  },
  {
    icon: Sword,
    title: "Compete against others",
    description:
      "Go head-to-head against another developer, or join a free-for-all lobby.",
  },
  {
    icon: Timer,
    title: "Solve against the clock",
    description:
      "Solve as many problems as you can before the match's time limit runs out.",
  },
  {
    icon: Flag,
    title: "Win or lose the match",
    description:
      "Submissions are judged instantly, so the outcome is clear the moment time is up.",
  },
  {
    icon: Trophy,
    title: "Climb the leaderboard",
    description:
      "Every match feeds your rating, so every rematch is a chance to climb higher.",
  },
];
