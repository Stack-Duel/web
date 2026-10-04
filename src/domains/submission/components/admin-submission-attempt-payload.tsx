"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";

const COLLAPSE_THRESHOLD = 500;

function formatPayload(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

type AdminSubmissionAttemptPayloadProps = {
  title: string;
  value: string | null;
};

export default function AdminSubmissionAttemptPayload({
  title,
  value,
}: Readonly<AdminSubmissionAttemptPayloadProps>) {
  const formatted = value ? formatPayload(value) : null;
  const [open, setOpen] = useState(
    (formatted?.length ?? 0) <= COLLAPSE_THRESHOLD
  );

  if (!formatted) {
    return null;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-1">
      <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {title} ({formatted.length.toLocaleString()} chars)
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm">
          {formatted}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}
