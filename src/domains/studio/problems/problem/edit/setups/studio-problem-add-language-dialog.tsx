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
import { useInitialStudioProblemSetup } from "@/domains/studio/api/get-initial-studio-problem-setup";
import { useAddStudioProblemSetup } from "@/domains/studio/api/add-studio-problem-setup";
import type { StudioProblemSetup } from "@/domains/studio/models/studio-problem-setup";

type StudioProblemAddLanguageDialogProps = {
  problemId: string;
  trackId: string | null;
  existingSetups: StudioProblemSetup[];
};

export default function StudioProblemAddLanguageDialog({
  problemId,
  trackId,
  existingSetups,
}: Readonly<StudioProblemAddLanguageDialogProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [languageVersionId, setLanguageVersionId] = useState("");

  const { data: languages } = useLanguages();
  const { data: studioSetup } = useInitialStudioProblemSetup();
  const { mutate: addSetup, isPending: isAdding } = useAddStudioProblemSetup();

  const track = studioSetup?.availableTracks?.find(
    (availableTrack) => availableTrack.id === trackId
  );

  const availableVersions = useMemo(() => {
    const configuredVersionIds = new Set(
      existingSetups.map((setup) => setup.languageVersionId)
    );
    const trackLanguageIds = new Set(
      (track?.languages ?? []).map((language) => language.id)
    );

    return (languages ?? [])
      .filter((language) => trackLanguageIds.has(language.id))
      .flatMap((language) =>
        language.versions
          .filter((version) => !configuredVersionIds.has(version.id))
          .map((version) => ({
            id: version.id,
            label: `${language.name} (${version.version})`,
          }))
      );
  }, [languages, track, existingSetups]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setLanguageVersionId("");
    setIsDialogOpen(isOpen);
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
              {track
                ? `Only languages on the ${track.name} track can be added. Each one needs starter code and a reference solution before the problem can be submitted for validation.`
                : "This problem has no active track, so there are no languages available to add."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="studio-setup-language">Language</Label>
            <Select
              value={languageVersionId}
              onValueChange={setLanguageVersionId}
              disabled={isAdding || availableVersions.length === 0}
            >
              <SelectTrigger id="studio-setup-language" className="w-full">
                <SelectValue
                  placeholder={
                    availableVersions.length === 0
                      ? "No languages left to add"
                      : "Select a language version"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableVersions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isAdding || !languageVersionId}
            >
              {isAdding ? "Adding..." : "Add language"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
