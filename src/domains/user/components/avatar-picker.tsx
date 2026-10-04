"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { useAvatarHistory } from "../api/get-avatar-history";
import { useSelectAvatar } from "../api/select-avatar";
import { useUploadAvatar } from "../api/upload-avatar";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp";

export default function AvatarPicker() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAvatarId, setPendingAvatarId] = useState<string | null>(null);

  const { data: history, isLoading } = useAvatarHistory();
  const uploadAvatar = useUploadAvatar();
  const selectAvatar = useSelectAvatar();

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    uploadAvatar.mutate(
      { file },
      {
        onSuccess: () => toast.success("Avatar updated"),
        onError: (error) =>
          toast.error(error.message || "Failed to upload avatar"),
      }
    );
  };

  const handleSelect = (avatarId: string) => {
    setPendingAvatarId(avatarId);
    selectAvatar.mutate(
      { avatarId },
      {
        onSuccess: () => toast.success("Avatar updated"),
        onError: (error) =>
          toast.error(error.message || "Failed to select avatar"),
        onSettled: () => setPendingAvatarId(null),
      }
    );
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      {!isLoading &&
        history?.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => handleSelect(avatar.id)}
            disabled={avatar.isCurrent || pendingAvatarId === avatar.id}
            aria-pressed={avatar.isCurrent}
            aria-label={avatar.isCurrent ? "Current avatar" : "Use this avatar"}
            className={cn(
              "h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-background transition-colors disabled:cursor-default",
              avatar.isCurrent
                ? "ring-primary"
                : "ring-transparent hover:ring-muted-foreground/40",
              pendingAvatarId === avatar.id && "opacity-50"
            )}
          >
            <Avatar className="size-full">
              <AvatarImage
                src={avatar.url}
                alt="Previous avatar"
                className="object-center"
              />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          </button>
        ))}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadAvatar.isPending}
        aria-label="Upload new avatar"
        className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground transition-colors hover:border-muted-foreground/70 hover:text-foreground disabled:opacity-50"
      >
        <Plus className="size-5" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  );
}
