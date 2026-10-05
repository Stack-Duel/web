import { Kbd } from "@/shared/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Fragment, type ReactNode } from "react";

type KeyboardShortcutTooltipProps = {
  children: ReactNode;
  label?: string;
  shortcut: readonly string[];
};

export function KeyboardShortcutTooltip({
  children,
  label,
  shortcut,
}: Readonly<KeyboardShortcutTooltipProps>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{children}</span>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>
        {label ? <span className="sr-only">{label}</span> : null}
        {shortcut.map((key, index) => (
          <Fragment key={key}>
            {index > 0 ? <span>+</span> : null}
            <Kbd>{key}</Kbd>
          </Fragment>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}
