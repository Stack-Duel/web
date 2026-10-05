"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import DifficultyBadge from "@/domains/problem/components/difficulty-badge";
import { useAdminProblems } from "@/domains/problem/api/get-admin-problems";
import { useUpdateDailyChallenge } from "../api/update-daily-challenge";

const SEARCH_DEBOUNCE_MS = 300;
const RESULT_LIMIT = 20;

type UpdateDailyChallengeDialogProps = {
  date: string;
  currentProblemTitle: string;
};

export default function UpdateDailyChallengeDialog({
  date,
  currentProblemTitle,
}: Readonly<UpdateDailyChallengeDialogProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [timestamp] = useState(() => new Date().toISOString());
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS).trim();

  const { data, isLoading } = useAdminProblems({
    page: 1,
    size: RESULT_LIMIT,
    timestamp,
    search: debouncedSearch || undefined,
  });

  const { mutateAsync: updateChallenge, isPending } = useUpdateDailyChallenge();

  const handleOpenChange = (open: boolean) => {
    if (open) setSearch("");
    setIsOpen(open);
  };

  const handleSelect = async (problemId: string, problemTitle: string) => {
    try {
      await updateChallenge({ date, problemId });
      toast.success(`Set "${problemTitle}" as the daily challenge for ${date}`);
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update daily challenge"
      );
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpenChange(true)}
      >
        Change
      </Button>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Change daily challenge for {date}</DialogTitle>
            <DialogDescription>
              Currently assigned: {currentProblemTitle}. Search for a
              replacement problem below.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug..."
            autoFocus
          />

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Searching...</p>
            ) : !data || data.results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No matching problems.
              </p>
            ) : (
              data.results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSelect(result.id, result.title)}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm hover:bg-muted/50 disabled:opacity-50"
                >
                  <span className="font-medium">{result.title}</span>
                  <DifficultyBadge difficulty={result.difficultyTier} />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
