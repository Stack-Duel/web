"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { useGroups } from "../api/get-groups";
import { useUpdateUserGroups } from "../api/update-user-groups";
import type { AdminUser } from "../models/admin-user";

type EditUserGroupsDialogProps = {
  user: AdminUser;
};

export default function EditUserGroupsDialog({
  user,
}: Readonly<EditUserGroupsDialogProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );

  const { data: groups, isLoading: isLoadingGroups } = useGroups();
  const { mutate: updateGroups, isPending } = useUpdateUserGroups();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSelectedGroupIds(new Set(user.groups.map((g) => g.id)));
    }
    setIsDialogOpen(open);
  };

  const toggleGroup = (groupId: string, checked: boolean) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(groupId);
      } else {
        next.delete(groupId);
      }
      return next;
    });
  };

  const handleSave = () => {
    updateGroups(
      { userId: user.id, groupIds: [...selectedGroupIds] },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success(`Updated groups for ${user.username}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update groups");
        },
      }
    );
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenChange(true);
        }}
      >
        <Settings2 size={14} /> Edit groups
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit groups for {user.username}</DialogTitle>
            <DialogDescription>
              Choose which groups this user belongs to. Group membership
              determines the roles and permissions they have.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {isLoadingGroups ? (
              <p className="text-sm text-muted-foreground">Loading groups...</p>
            ) : !groups || groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No groups available.
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedGroupIds.has(group.id)}
                    onCheckedChange={(checked) =>
                      toggleGroup(group.id, checked === true)
                    }
                  />
                  <Label htmlFor={`group-${group.id}`}>{group.name}</Label>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || isLoadingGroups}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
