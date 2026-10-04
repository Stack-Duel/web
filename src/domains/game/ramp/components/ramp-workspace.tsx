"use client";

import { EditorWindowTabNode } from "@/domains/workspace/editor-window/state/editor-window-store";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Activity, ArrowLeft, CodeXml, History, Trophy } from "lucide-react";
import { useMemo } from "react";
import {
  useProblemSetupStore,
  selectCurrentProblem,
} from "@/domains/problem/state/problem-setup-store";
import { WorkspaceEditorWindow } from "@/domains/workspace/editor-window/workspace-editor-window";
import {
  createDescriptionTab,
  createTestsTab,
  FlaskConicalTabIcon,
} from "@/domains/workspace/editor-window/tabs/shared-editor-tabs";
import { useProblemById } from "@/domains/problem/api/get-problem-by-id";
import { Button } from "@/shared/components/ui/button";
import {
  useGameSessionStore,
  selectViewingProblemId,
} from "../../state/game-session-store";
import type { GameWorkspaceProps } from "../../models/game-workspace";
import RampCodeEditor from "./ramp-code-editor";
import RampSubmissionTab from "./ramp-submission-tab";
import RampHistoryTab from "./ramp-history-tab";
import RampStandings from "./ramp-standings";
import RampActivityFeed from "./ramp-activity-feed";

/**
 * The "ramp" workspace: solve problems that get harder as you go, matched to
 * DifficultyRampProblemSelectionStrategy on the server. This is the shared
 * per-participant gameplay engine (tabs, mobile layout, code editor, problem
 * history). Every mode's strategy (Solo Rush, Duel, FFA) uses this same
 * component while Running, since the loop is identical per player regardless
 * of how many others are in the game. Reads problem/code/submission state
 * from the zustand stores.
 */
export default function RampWorkspace({ game }: Readonly<GameWorkspaceProps>) {
  const liveProblem = useProblemSetupStore(selectCurrentProblem);
  const isMobile = useIsMobile();

  const viewingProblemId = useGameSessionStore(selectViewingProblemId);
  const viewProblem = useGameSessionStore((s) => s.viewProblem);
  const returnToCurrentProblem = useGameSessionStore(
    (s) => s.returnToCurrentProblem
  );
  const isViewingHistory = viewingProblemId !== null;

  const { data: historicalProblem } = useProblemById({
    id: viewingProblemId ?? "",
    queryConfig: { enabled: isViewingHistory },
  });

  const displayProblem = isViewingHistory
    ? (historicalProblem ?? null)
    : liveProblem;

  const tabs = useMemo((): EditorWindowTabNode => {
    const descriptionTab = createDescriptionTab({
      problem: displayProblem,
      loadingFallback: (
        <div className="p-4 text-sm text-muted-foreground">
          Loading problem...
        </div>
      ),
    });

    const historyTab = {
      key: "history",
      name: "History",
      icon: (
        <History size={16} className="text-purple-600 dark:text-purple-400" />
      ),
      component: (
        <RampHistoryTab
          gameId={game.gameId}
          currentProblemId={liveProblem?.id ?? null}
          viewingProblemId={viewingProblemId}
          onSelectProblem={viewProblem}
          onReturnToCurrent={returnToCurrentProblem}
        />
      ),
    };

    // Only meaningful once there's someone to compare against. Solo Rush games always have
    // exactly one participant, so the tab would just show a single row duplicating the header's
    // own ScoreBadge.
    const isMultiplayer = game.participants.length > 1;
    const scoreTab = {
      key: "score",
      name: "Score",
      icon: <Trophy size={16} className="text-amber-600 dark:text-amber-400" />,
      component: <RampStandings game={game} />,
    };

    const activityTab = {
      key: "activity",
      name: "Activity",
      icon: <Activity size={16} className="text-rose-600 dark:text-rose-400" />,
      component: <RampActivityFeed game={game} />,
    };

    const problemTabs = {
      key: "problem",
      name: "Problem",
      children: isMultiplayer
        ? [descriptionTab, historyTab, scoreTab]
        : [descriptionTab, historyTab],
    };

    const testsTab = createTestsTab(displayProblem?.publicTestCases);

    const submissionTab = {
      key: "submission",
      name: "Submission",
      icon: <FlaskConicalTabIcon />,
      component: (
        <RampSubmissionTab
          gameId={game.gameId}
          viewingProblemId={viewingProblemId}
          isViewingHistory={isViewingHistory}
        />
      ),
    };

    const executionTabs = {
      key: "execution",
      name: "Execution",
      children: [testsTab, submissionTab],
    };

    const codeTab = {
      key: "code",
      name: "Code",
      icon: (
        <CodeXml size={16} className="text-green-600 dark:text-green-400" />
      ),
      component: (
        <RampCodeEditor
          gameId={game.gameId}
          viewingProblemId={viewingProblemId}
          isViewingHistory={isViewingHistory}
          availableLanguages={displayProblem?.availableLanguages}
        />
      ),
    };

    if (isMobile) {
      return {
        children: [
          codeTab,
          { ...descriptionTab, key: "problem", name: "Problem" },
          testsTab,
          submissionTab,
          historyTab,
          ...(isMultiplayer ? [scoreTab, activityTab] : []),
        ],
      };
    }

    // Activity is its own always-visible pane (not a tab nested in another group) so a player
    // sees the live chat/attempt feed without having to click over to it. EditorWindowTab only
    // ever mounts the *active* tab of a group, so nesting it would hide it exactly like before.
    // Placed to the right of the Problem/Execution column, not the left, so Code stays adjacent
    // to the Problem description.
    return {
      orientation: "horizontal",
      children: [
        {
          ...codeTab,
          defaultSize: isMultiplayer ? 45 : 50,
        },
        {
          key: "right-column",
          defaultSize: isMultiplayer ? 33 : 50,
          orientation: "vertical",
          children: [
            {
              ...problemTabs,
              defaultSize: 55,
            },
            {
              ...executionTabs,
              defaultSize: 45,
            },
          ],
        },
        ...(isMultiplayer ? [{ ...activityTab, defaultSize: 22 }] : []),
      ],
    };
  }, [
    game,
    displayProblem,
    isViewingHistory,
    isMobile,
    liveProblem,
    viewingProblemId,
    viewProblem,
    returnToCurrentProblem,
  ]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {isViewingHistory ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <span>
            Viewing{" "}
            <span className="font-semibold">
              {historicalProblem?.title ?? "a previous problem"}
            </span>{" "}
            (solved, read-only).
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            onClick={returnToCurrentProblem}
          >
            <ArrowLeft size={14} /> Back to current problem
          </Button>
        </div>
      ) : null}

      <div className="min-h-0 flex-1">
        <WorkspaceEditorWindow tabs={tabs} />
      </div>
    </div>
  );
}
