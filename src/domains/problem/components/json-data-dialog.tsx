"use client";

import { useState } from "react";
import { Braces, Copy } from "lucide-react";
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

type JsonDataDialogProps = {
  title: string;
  description: string;
  triggerLabel?: string;
  isDisabled?: boolean;
  getCurrentJson: () => unknown;
  onApply: (parsed: unknown) => void;
};

export default function JsonDataDialog({
  title,
  description,
  triggerLabel = "JSON",
  isDisabled = false,
  getCurrentJson,
  onApply,
}: Readonly<JsonDataDialogProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setText(JSON.stringify(getCurrentJson(), null, 2));
      setError(null);
    }
    setIsDialogOpen(isOpen);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied JSON");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleApply = () => {
    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      setError("That is not valid JSON.");
      return;
    }

    try {
      onApply(parsed);
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "That JSON does not match the expected shape."
      );
      return;
    }

    setIsDialogOpen(false);
    toast.success("Loaded JSON into the form");
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={isDisabled}
        onClick={() => handleOpenChange(true)}
      >
        <Braces size={16} /> {triggerLabel}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <Textarea
            aria-label={`${title} content`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            className="min-h-80 font-mono text-xs"
            spellCheck={false}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handleCopy}
            >
              <Copy size={16} /> Copy
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleApply}>
                Apply to form
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
