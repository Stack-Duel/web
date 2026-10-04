"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useLanguages } from "@/domains/language/api/get-languages";
import { useAddProblemSetup } from "../api/add-problem-setup";
import type { AdminProblemSetup } from "../models/admin-problem";

type AddProblemSetupLanguageDialogProps = {
  problemId: string;
  existingSetups: AdminProblemSetup[];
};

export default function AddProblemSetupLanguageDialog({
  problemId,
  existingSetups,
}: Readonly<AddProblemSetupLanguageDialogProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [languageVersionId, setLanguageVersionId] = useState("");

  const { data: languages } = useLanguages();
  const { mutate: addSetup, isPending: isAdding } = useAddProblemSetup();

  const options = useMemo(() => {
    const existingVersionIds = new Set(
      existingSetups.map((s) => s.languageVersionId)
    );

    return (languages ?? []).flatMap((language) =>
      language.versions
        .filter((version) => !existingVersionIds.has(version.id))
        .map((version) => ({
          id: version.id,
          label: `${language.name} (${version.version})`,
        }))
    );
  }, [languages, existingSetups]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLanguageVersionId("");
    }
    setIsDialogOpen(open);
  };

  const handleAdd = () => {
    if (!languageVersionId) {
      toast.error("Select a language version.");
      return;
    }

    addSetup(
      { problemId, languageVersionId },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success("Added language setup");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to add language setup");
        },
      }
    );
  };

  return (
    <>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => handleOpenChange(true)}
      >
        <Plus size={16} /> Add language
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add language setup</DialogTitle>
            <DialogDescription>
              Add a setup for any active language, not just the ones required
              for this problem&apos;s track. You&apos;ll still need to fill in a
              reference solution before submitting for validation.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-setup-language">Language</Label>
              <Select
                value={languageVersionId}
                onValueChange={setLanguageVersionId}
                disabled={isAdding}
              >
                <SelectTrigger id="new-setup-language" className="w-full">
                  <SelectValue placeholder="Select a language version" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add language"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
