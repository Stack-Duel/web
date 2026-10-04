"use client";

import ForfeitButton from "@/domains/game/components/forfeit-button";
import { LanguageSelect } from "@/domains/workspace/language-select/components/language-select";
import { KeyboardShortcutTooltip } from "@/shared/components/keyboard-shortcut-tooltip";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { ModeToggle } from "@/shared/theme/mode-toggle";
import { useKeyboardCommand } from "@/shared/hooks/use-keyboard-command";
import { ArrowRight, Menu } from "lucide-react";
import type { GameWorkspaceProps } from "../../models/game-workspace";
import {
  useProblemSetupStore,
  selectCurrentProblem,
} from "@/domains/problem/state/problem-setup-store";
import { useProblemSetupSync } from "@/domains/problem/hooks/use-problem-setup-sync";
import {
  useWorkspaceStore,
  selectSelectedVersionId,
  selectIsSubmittingSubmission,
} from "@/domains/workspace/state/workspace-store";
import {
  useGameSessionStore,
  selectPendingNextProblemId,
  selectViewingProblemId,
} from "../../state/game-session-store";
import { useRampSubmission } from "../../hooks/use-ramp-submission";
import { useLoadNextProblem } from "../../hooks/use-load-next-problem";
import { useSubmitSolution } from "@/domains/workspace/hooks/use-submit-solution";
import { useUserStore, selectUser } from "@/domains/user/state/user-store";
import GameScoreHeader from "@/domains/game/components/game-score-header";
import SelfScoreBadge from "@/domains/game/components/self-score-badge";
import SkipProblemButton from "@/domains/game/components/skip-problem-button";
import GameTimer from "@/domains/game/components/game-timer";
import { useGameTimeExpired } from "@/domains/game/hooks/use-game-time-expired";

export default function RampWorkspaceHeader({
  game,
}: Readonly<GameWorkspaceProps>) {
  const user = useUserStore(selectUser);
  const currentProblem = useProblemSetupStore(selectCurrentProblem);
  const { setup: problemSetup, isLoading: isProblemSetupLoading } =
    useProblemSetupSync();
  const isSubmittingSubmission = useWorkspaceStore(
    selectIsSubmittingSubmission
  );
  const selectedVersionId = useWorkspaceStore(selectSelectedVersionId);
  const selectVersion = useWorkspaceStore((s) => s.selectVersion);
  const pendingNextProblemId = useGameSessionStore(selectPendingNextProblemId);
  const viewingProblemId = useGameSessionStore(selectViewingProblemId);
  const isViewingHistory = viewingProblemId !== null;

  const { submit } = useRampSubmission();
  const loadNextProblem = useLoadNextProblem();
  const { runCode } = useSubmitSolution(problemSetup?.id ?? null);
  const onTimeExpired = useGameTimeExpired(game.gameId);

  const isSolo = game.participants.length <= 1;

  const onSubmitSolution = () => {
    if (!currentProblem || !problemSetup) return;
    void submit({
      game,
      problemId: currentProblem.id,
      problemSetupId: problemSetup.id,
    });
  };

  const onNextProblem = () => {
    void loadNextProblem(pendingNextProblemId);
  };

  const problemSolved = pendingNextProblemId !== undefined && !isViewingHistory;
  const canSubmitSolution =
    !!problemSetup &&
    !isProblemSetupLoading &&
    !isSubmittingSubmission &&
    !problemSolved &&
    !isViewingHistory;
  const canRunCode = canSubmitSolution;

  const runLabel = isSubmittingSubmission ? "Running..." : "Run";
  const submitLabel = isSubmittingSubmission ? "Submitting..." : "Submit";

  useKeyboardCommand({
    key: "Enter",
    onCommand: onSubmitSolution,
    enabled: canSubmitSolution,
    modifier: "ctrl",
  });

  return (
    <div className="@container grid flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      <div className="items-center gap-2 flex justify-self-start">
        {problemSolved ? (
          <Button
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white hidden @3xl:flex"
            onClick={onNextProblem}
          >
            Next Problem <ArrowRight size={14} />
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              className="w-20 hidden @3xl:flex"
              variant="secondary"
              disabled={!canRunCode}
              onClick={runCode}
            >
              {runLabel}
            </Button>
            <KeyboardShortcutTooltip
              label="Submit solution"
              shortcut={["Ctrl", "Enter"]}
            >
              <Button
                size="sm"
                className="w-20 hidden @3xl:flex"
                disabled={!canSubmitSolution}
                onClick={onSubmitSolution}
              >
                {submitLabel}
              </Button>
            </KeyboardShortcutTooltip>
            <SkipProblemButton
              game={game}
              problemId={currentProblem?.id}
              disabled={!canSubmitSolution}
              className="hidden @3xl:flex"
            />
          </>
        )}
        {isSolo ? <SelfScoreBadge game={game} /> : null}
      </div>

      <div className="min-w-0 justify-self-center">
        {isSolo ? (
          <GameTimer game={game} onTimeExpired={onTimeExpired} />
        ) : (
          <GameScoreHeader game={game} />
        )}
      </div>

      <div className="flex min-w-0 items-center gap-2 justify-self-end">
        <div className="hidden items-center gap-2 @5xl:flex">
          <LanguageSelect
            languages={currentProblem?.availableLanguages ?? []}
            selectedVersionId={selectedVersionId}
            onSelectVersion={selectVersion}
            preferredLanguageIds={user?.languagePreferenceIds}
          />
          <ForfeitButton gameId={game.gameId} />
          <ModeToggle />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="-mr-1 @5xl:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="@container flex flex-col">
            <SheetHeader>
              <SheetTitle>Game options</SheetTitle>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 px-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Language
                </span>
                <LanguageSelect
                  languages={currentProblem?.availableLanguages ?? []}
                  selectedVersionId={selectedVersionId}
                  onSelectVersion={selectVersion}
                  preferredLanguageIds={user?.languagePreferenceIds}
                  className="flex-1 min-w-0 flex-col items-stretch @xs:flex-row @xs:items-center"
                  triggerClassName="w-full @xs:w-32"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <ModeToggle />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Game</span>
                <ForfeitButton gameId={game.gameId} />
              </div>
            </div>

            <SheetFooter className="px-4 pb-4">
              {problemSolved ? (
                <Button
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={onNextProblem}
                >
                  Next Problem <ArrowRight size={14} />
                </Button>
              ) : (
                <div className="grid w-full grid-cols-1 gap-2 @xs:grid-cols-2">
                  <Button
                    variant="outline"
                    disabled={!canRunCode}
                    onClick={runCode}
                  >
                    {runLabel}
                  </Button>
                  <Button
                    disabled={!canSubmitSolution}
                    onClick={onSubmitSolution}
                  >
                    {submitLabel}
                  </Button>
                  <SkipProblemButton
                    game={game}
                    problemId={currentProblem?.id}
                    disabled={!canSubmitSolution}
                    className="@xs:col-span-2"
                  />
                </div>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
