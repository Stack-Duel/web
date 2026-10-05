"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useCreateFeatureFlag } from "../api/create-feature-flag";

export default function CreateFeatureFlagDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultEnabled, setDefaultEnabled] = useState(false);

  const { mutate: createFlag, isPending: isCreating } = useCreateFeatureFlag();

  const resetForm = () => {
    setKey("");
    setName("");
    setDescription("");
    setDefaultEnabled(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      resetForm();
    }
    setIsDialogOpen(open);
  };

  const handleCreate = () => {
    if (!key.trim() || !name.trim()) {
      toast.error("Key and name are required.");
      return;
    }

    createFlag(
      {
        key: key.trim(),
        name: name.trim(),
        description: description.trim(),
        defaultEnabled,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success(`Created feature flag "${key}"`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create feature flag");
        },
      }
    );
  };

  return (
    <>
      <Button className="gap-2" onClick={() => handleOpenChange(true)}>
        <Plus size={16} /> Create Flag
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create feature flag</DialogTitle>
            <DialogDescription>
              Key, name, and description can only be set here. There is
              currently no way to edit them after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="flag-key">Key</Label>
              <Input
                id="flag-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. new-leaderboard-ui"
                disabled={isCreating}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="flag-name">Name</Label>
              <Input
                id="flag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="flag-description">Description</Label>
              <Textarea
                id="flag-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="flag-default-enabled"
                checked={defaultEnabled}
                onCheckedChange={(checked) =>
                  setDefaultEnabled(checked === true)
                }
                disabled={isCreating}
              />
              <Label htmlFor="flag-default-enabled">Enabled by default</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create flag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
