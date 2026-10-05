"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useHasMounted } from "@/shared/hooks/use-has-mounted";
import {
  useUserStore,
  selectIsAuthenticated,
} from "@/domains/user/state/user-store";
import { useProblemReactionSummary } from "../api/get-problem-reaction-summary";
import { useSetProblemReaction } from "../api/set-problem-reaction";

const LIKE_KEY = "like";
const DISLIKE_KEY = "dislike";

type ProblemReactionButtonsProps = {
  problemId: string;
  className?: string;
};

export function ProblemReactionButtons({
  problemId,
  className,
}: Readonly<ProblemReactionButtonsProps>) {
  const isAuthenticated = useUserStore(selectIsAuthenticated);
  const hasMounted = useHasMounted();
  const { data } = useProblemReactionSummary({ problemId });
  const mutation = useSetProblemReaction({
    mutationConfig: {
      onError: () =>
        toast.error("Couldn't update your reaction. Please try again."),
    },
  });

  const counts = data?.counts ?? [];
  const currentUserReactionKey = data?.currentUserReactionKey ?? null;
  const likeCount = counts.find((c) => c.key === LIKE_KEY)?.count ?? 0;
  const dislikeCount = counts.find((c) => c.key === DISLIKE_KEY)?.count ?? 0;

  const react = (reactionTypeKey: string) => {
    mutation.mutate({ problemId, reactionTypeKey });
  };

  const isDisabled = !hasMounted || !isAuthenticated || mutation.isPending;
  const signInTitle =
    hasMounted && isAuthenticated ? undefined : "Sign in to react";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={currentUserReactionKey === LIKE_KEY}
        aria-label="Like"
        disabled={isDisabled}
        title={signInTitle}
        onClick={() => react(LIKE_KEY)}
      >
        <ThumbsUp
          className={cn(
            currentUserReactionKey === LIKE_KEY && "fill-primary text-primary"
          )}
        />
        <span className="tabular-nums">{likeCount}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={currentUserReactionKey === DISLIKE_KEY}
        aria-label="Dislike"
        disabled={isDisabled}
        title={signInTitle}
        onClick={() => react(DISLIKE_KEY)}
      >
        <ThumbsDown
          className={cn(
            currentUserReactionKey === DISLIKE_KEY &&
              "fill-destructive text-destructive"
          )}
        />
        <span className="tabular-nums">{dislikeCount}</span>
      </Button>
    </div>
  );
}
