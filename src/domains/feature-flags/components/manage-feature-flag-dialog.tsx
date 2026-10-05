"use client";

import { useState } from "react";
import { Settings2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useGroups } from "@/domains/user/api/get-groups";
import { useUpdateFeatureFlagRollout } from "../api/update-feature-flag-rollout";
import { useSetFeatureFlagUserOverride } from "../api/set-feature-flag-user-override";
import { useRemoveFeatureFlagUserOverride } from "../api/remove-feature-flag-user-override";
import { useSetFeatureFlagGroupOverride } from "../api/set-feature-flag-group-override";
import { useRemoveFeatureFlagGroupOverride } from "../api/remove-feature-flag-group-override";
import type {
  DecisionEffect,
  FeatureFlagAdmin,
} from "../models/feature-flag-admin";

type ManageFeatureFlagDialogProps = {
  flag: FeatureFlagAdmin;
};

export default function ManageFeatureFlagDialog({
  flag,
}: Readonly<ManageFeatureFlagDialogProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rolloutInput, setRolloutInput] = useState(
    String(flag.rolloutPercentage)
  );
  const [newUserId, setNewUserId] = useState("");
  const [newUserEffect, setNewUserEffect] = useState<DecisionEffect>("Allow");
  const [newGroupId, setNewGroupId] = useState<string | undefined>();
  const [newGroupEffect, setNewGroupEffect] = useState<DecisionEffect>("Allow");

  const { data: groups } = useGroups();
  const { mutate: updateRollout, isPending: isUpdatingRollout } =
    useUpdateFeatureFlagRollout();
  const { mutate: setUserOverride, isPending: isSettingUserOverride } =
    useSetFeatureFlagUserOverride();
  const { mutate: removeUserOverride } = useRemoveFeatureFlagUserOverride();
  const { mutate: setGroupOverride, isPending: isSettingGroupOverride } =
    useSetFeatureFlagGroupOverride();
  const { mutate: removeGroupOverride } = useRemoveFeatureFlagGroupOverride();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setRolloutInput(String(flag.rolloutPercentage));
      setNewUserId("");
      setNewUserEffect("Allow");
      setNewGroupId(undefined);
      setNewGroupEffect("Allow");
    }
    setIsDialogOpen(open);
  };

  const handleUpdateRollout = () => {
    const value = Number(rolloutInput);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      toast.error("Rollout percentage must be between 0 and 100.");
      return;
    }

    updateRollout(
      { id: flag.id, rolloutPercentage: value },
      {
        onSuccess: () => toast.success("Updated rollout percentage"),
        onError: (error) =>
          toast.error(error.message || "Failed to update rollout"),
      }
    );
  };

  const handleAddUserOverride = () => {
    if (!newUserId.trim()) {
      toast.error("Enter a user id.");
      return;
    }

    setUserOverride(
      { id: flag.id, userId: newUserId.trim(), effect: newUserEffect },
      {
        onSuccess: () => {
          setNewUserId("");
          toast.success("Added user override");
        },
        onError: (error) =>
          toast.error(error.message || "Failed to add user override"),
      }
    );
  };

  const handleRemoveUserOverride = (userId: string) => {
    removeUserOverride(
      { id: flag.id, userId },
      {
        onSuccess: () => toast.success("Removed user override"),
        onError: (error) =>
          toast.error(error.message || "Failed to remove user override"),
      }
    );
  };

  const handleAddGroupOverride = () => {
    if (!newGroupId) {
      toast.error("Choose a group.");
      return;
    }

    setGroupOverride(
      { id: flag.id, groupId: newGroupId, effect: newGroupEffect },
      {
        onSuccess: () => {
          setNewGroupId(undefined);
          toast.success("Added group override");
        },
        onError: (error) =>
          toast.error(error.message || "Failed to add group override"),
      }
    );
  };

  const handleRemoveGroupOverride = (groupId: string) => {
    removeGroupOverride(
      { id: flag.id, groupId },
      {
        onSuccess: () => toast.success("Removed group override"),
        onError: (error) =>
          toast.error(error.message || "Failed to remove group override"),
      }
    );
  };

  const groupName = (groupId: string) =>
    groups?.find((g) => g.id === groupId)?.name ?? groupId;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={() => handleOpenChange(true)}
      >
        <Settings2 size={14} /> Manage
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage {flag.key}</DialogTitle>
            <DialogDescription>
              {flag.name}: {flag.description || "No description"}. Name and
              description are set at creation and cannot be edited here.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rollout-percentage">Rollout percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="rollout-percentage"
                  type="number"
                  min={0}
                  max={100}
                  value={rolloutInput}
                  onChange={(e) => setRolloutInput(e.target.value)}
                  disabled={isUpdatingRollout}
                  className="w-24"
                />
                <Button
                  size="sm"
                  onClick={handleUpdateRollout}
                  disabled={isUpdatingRollout}
                >
                  {isUpdatingRollout ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>User overrides</Label>
              {flag.userOverrides.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No user overrides.
                </p>
              ) : (
                flag.userOverrides.map((override) => (
                  <div
                    key={override.userId}
                    className="flex items-center gap-2"
                  >
                    <span className="font-mono text-xs truncate flex-1">
                      {override.userId}
                    </span>
                    <Badge
                      variant={
                        override.effect === "Allow"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {override.effect}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove user override for ${override.userId}`}
                      onClick={() => handleRemoveUserOverride(override.userId)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))
              )}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="User id (GUID)"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  disabled={isSettingUserOverride}
                  className="flex-1"
                />
                <Select
                  value={newUserEffect}
                  onValueChange={(value) =>
                    setNewUserEffect(value as DecisionEffect)
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Allow">Allow</SelectItem>
                    <SelectItem value="Deny">Deny</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  aria-label="Add user override"
                  onClick={handleAddUserOverride}
                  disabled={isSettingUserOverride}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                No user search yet. Paste a raw user id.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Group overrides</Label>
              {flag.groupOverrides.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No group overrides.
                </p>
              ) : (
                flag.groupOverrides.map((override) => (
                  <div
                    key={override.groupId}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm flex-1">
                      {groupName(override.groupId)}
                    </span>
                    <Badge
                      variant={
                        override.effect === "Allow"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {override.effect}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove group override for ${groupName(override.groupId)}`}
                      onClick={() =>
                        handleRemoveGroupOverride(override.groupId)
                      }
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))
              )}
              <div className="flex items-center gap-2">
                <Select value={newGroupId} onValueChange={setNewGroupId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {(groups ?? []).map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newGroupEffect}
                  onValueChange={(value) =>
                    setNewGroupEffect(value as DecisionEffect)
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Allow">Allow</SelectItem>
                    <SelectItem value="Deny">Deny</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  aria-label="Add group override"
                  onClick={handleAddGroupOverride}
                  disabled={isSettingGroupOverride}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
