"use client";
import {
  selectIsAuthenticated,
  selectUser,
  selectUserPermissions,
  useUserStore,
} from "@/domains/user/state/user-store";
import { Problem } from "@/domains/problem/models/problem";
import { LanguageSelect } from "../language-select/components/language-select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { ClipboardList, Lock, Menu } from "lucide-react";
import Link from "next/link";
import { routerConfig } from "@/shared/router-config";
import {
  useWorkspaceStore,
  selectIsSubmittingSubmission,
  selectSelectedVersionId,
} from "../state/workspace-store";
import { useSubmitSolution } from "../hooks/use-submit-solution";
import { ModeToggle } from "@/shared/theme/mode-toggle";
import { Permissions } from "@/shared/lib/permissions";
import { useKeyboardCommand } from "@/shared/hooks/use-keyboard-command";
import { KeyboardShortcutTooltip } from "@/shared/components/keyboard-shortcut-tooltip";
import { useHasMounted } from "@/shared/hooks/use-has-mounted";

type WorkspaceHeaderProps = {
  problem: Problem;
  problemSetupId: string | null;
};

export const WorkspaceHeader = ({
  problem,
  problemSetupId,
}: WorkspaceHeaderProps) => {
  const isAuthenticated = useUserStore(selectIsAuthenticated);
  const hasMounted = useHasMounted();
  const user = useUserStore(selectUser);
  const isSubmittingSubmission = useWorkspaceStore(
    selectIsSubmittingSubmission
  );
  const userPermissions = useUserStore(selectUserPermissions);
  const selectedVersionId = useWorkspaceStore(selectSelectedVersionId);
  const onSelectVersion = useWorkspaceStore((s) => s.selectVersion);
  const { runCode, submitCode } = useSubmitSolution(problemSetupId);

  const canRunCode = userPermissions.includes(Permissions.SUBMISSION_CREATE);
  const canSubmitSolution =
    hasMounted && isAuthenticated && !isSubmittingSubmission && canRunCode;

  useKeyboardCommand({
    key: "Enter",
    onCommand: submitCode,
    enabled: canSubmitSolution,
    modifier: "ctrl",
  });

  const runLabel = isSubmittingSubmission ? "Running..." : "Run";
  const submitLabel = isSubmittingSubmission ? "Submitting..." : "Submit";
  return (
    <div className="p-1 flex flex-1 items-center">
      <div className="hidden md:grid md:flex-1 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div />
        <ul className="flex justify-center gap-1">
          <li>
            <Button
              className="w-24"
              data-cy="run-btn"
              variant="secondary"
              disabled={
                !hasMounted ||
                !isAuthenticated ||
                isSubmittingSubmission ||
                !canRunCode
              }
              onClick={runCode}
            >
              {!isAuthenticated ? <Lock /> : null} {runLabel}
            </Button>
          </li>
          <li>
            <KeyboardShortcutTooltip
              label="Submit solution"
              shortcut={["Ctrl", "Enter"]}
            >
              <Button
                className="w-24"
                data-cy="submit-btn"
                disabled={!canSubmitSolution}
                onClick={submitCode}
              >
                {!isAuthenticated ? <Lock /> : null} {submitLabel}
              </Button>
            </KeyboardShortcutTooltip>
          </li>
          <li>
            <Button variant="ghost" asChild>
              <Link
                href={routerConfig.problemSubmissions.execute({
                  slug: problem.slug,
                })}
              >
                View Submissions
              </Link>
            </Button>
          </li>
        </ul>
        <div className="justify-self-end flex items-center gap-2">
          <LanguageSelect
            languages={problem.availableLanguages ?? []}
            selectedVersionId={selectedVersionId}
            onSelectVersion={onSelectVersion}
            preferredLanguageIds={user?.languagePreferenceIds}
          />
          <ModeToggle />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1 md:hidden">
        <Button
          className="w-20"
          data-cy="run-btn"
          variant="secondary"
          disabled={
            !hasMounted ||
            !isAuthenticated ||
            isSubmittingSubmission ||
            !canRunCode
          }
          onClick={runCode}
        >
          {!isAuthenticated ? <Lock /> : null} {runLabel}
        </Button>
        <KeyboardShortcutTooltip
          label="Submit solution"
          shortcut={["Ctrl", "Enter"]}
        >
          <Button
            className="w-24"
            data-cy="submit-btn"
            disabled={!canSubmitSolution}
            onClick={submitCode}
          >
            {!isAuthenticated ? <Lock /> : null} {submitLabel}
          </Button>
        </KeyboardShortcutTooltip>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="ml-1 -mr-1 md:hidden">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{problem.title}</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 flex-1 px-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Language
              </span>
              <div className="flex flex-wrap gap-2">
                <LanguageSelect
                  languages={problem.availableLanguages ?? []}
                  selectedVersionId={selectedVersionId}
                  onSelectVersion={onSelectVersion}
                  preferredLanguageIds={user?.languagePreferenceIds}
                  className="flex-1 min-w-0"
                />
              </div>
            </div>

            <Separator />

            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href={`/problems/${problem.slug}/submissions`}>
                <ClipboardList size={16} />
                View Submissions
              </Link>
            </Button>
          </div>

          <SheetFooter className="px-4 pb-4">
            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                variant="outline"
                data-cy="run-btn"
                disabled={
                  !isAuthenticated || isSubmittingSubmission || !canRunCode
                }
                onClick={runCode}
              >
                {!isAuthenticated ? <Lock /> : null} {runLabel}
              </Button>
              <KeyboardShortcutTooltip
                label="Submit solution"
                shortcut={["Ctrl", "Enter"]}
              >
                <Button
                  className="w-full"
                  data-cy="submit-btn"
                  disabled={!canSubmitSolution}
                  onClick={submitCode}
                >
                  {!isAuthenticated ? <Lock /> : null} {submitLabel}
                </Button>
              </KeyboardShortcutTooltip>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
