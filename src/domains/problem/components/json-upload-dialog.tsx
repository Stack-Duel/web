"use client";

import { useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type JsonUploadDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  exampleJson: string;
  onSubmit: (parsed: unknown) => Promise<void>;
};

export default function JsonUploadDialog({
  triggerLabel,
  title,
  description,
  exampleJson,
  onSubmit,
}: Readonly<JsonUploadDialogProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open) setText("");
    setIsDialogOpen(open);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setText(await file.text());
  };

  const handleCopyExample = async () => {
    try {
      await navigator.clipboard.writeText(exampleJson);
      toast.success("Copied example schema");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleSubmit = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      toast.error("That's not valid JSON.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(parsed);
      setIsDialogOpen(false);
      toast.success("Uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => handleOpenChange(true)}
      >
        <Upload size={16} /> {triggerLabel}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <input
                type="file"
                aria-label="Upload JSON file"
                accept="application/json,.json"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="text-sm text-muted-foreground"
              />
              <Button variant="ghost" size="sm" onClick={handleCopyExample}>
                Copy example schema
              </Button>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={exampleJson}
              rows={14}
              disabled={isSubmitting}
              className="font-mono text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !text.trim()}
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
