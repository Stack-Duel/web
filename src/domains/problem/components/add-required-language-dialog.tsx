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
import { useAddRequiredProblemLanguage } from "../api/required-languages/add-required-problem-language";
import { useRequiredProblemLanguages } from "../api/required-languages/get-required-problem-languages";

export default function AddRequiredLanguageDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [languageVersionId, setLanguageVersionId] = useState("");

  const { data: languages } = useLanguages();
  const { data: required } = useRequiredProblemLanguages();
  const { mutate: addLanguage, isPending: isAdding } =
    useAddRequiredProblemLanguage();

  const options = useMemo(() => {
    const requiredVersionIds = new Set(
      (required ?? []).map((r) => r.languageVersionId)
    );

    return (languages ?? []).flatMap((language) =>
      language.versions
        .filter((version) => !requiredVersionIds.has(version.id))
        .map((version) => ({
          id: version.id,
          label: `${language.name} (${version.version})`,
        }))
    );
  }, [languages, required]);

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

    addLanguage(
      { languageVersionId },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success("Added required language");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to add required language");
        },
      }
    );
  };

  return (
    <>
      <Button className="gap-2" onClick={() => handleOpenChange(true)}>
        <Plus size={16} /> Add Language
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add required language</DialogTitle>
            <DialogDescription>
              Every new problem will need a reference solution and sample test
              cases for this language before it can be submitted for validation.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="required-language">Language</Label>
              <Select
                value={languageVersionId}
                onValueChange={setLanguageVersionId}
                disabled={isAdding}
              >
                <SelectTrigger id="required-language" className="w-full">
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
