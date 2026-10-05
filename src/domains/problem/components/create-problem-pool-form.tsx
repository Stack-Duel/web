"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useCreateProblemPool } from "../api/create-problem-pool";

export default function CreateProblemPoolForm() {
  const [key, setKey] = useState("");
  const [name, setName] = useState("");

  const { mutate: createPool, isPending } = useCreateProblemPool();

  const handleCreate = () => {
    const trimmedKey = key.trim().toLowerCase();
    const trimmedName = name.trim();
    if (!trimmedKey || !trimmedName) return;

    createPool(
      { key: trimmedKey, name: trimmedName },
      {
        onSuccess: () => {
          setKey("");
          setName("");
          toast.success(`Pool "${trimmedName}" created`);
        },
        onError: (error) =>
          toast.error(error.message || "Failed to create pool"),
      }
    );
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1.5">
        <Label htmlFor="new-pool-key">Key</Label>
        <Input
          id="new-pool-key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="daily-challenge"
          className="w-40"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-pool-name">Name</Label>
        <Input
          id="new-pool-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Daily challenge"
          className="w-48"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={isPending || !key.trim() || !name.trim()}
        onClick={handleCreate}
      >
        <Plus size={14} /> New pool
      </Button>
    </div>
  );
}
