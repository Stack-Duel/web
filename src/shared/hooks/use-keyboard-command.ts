import { useEffect, useEffectEvent } from "react";

type KeyboardCommandOptions = {
  key: string;
  onCommand: () => void;
  enabled?: boolean;
  modifier?: "ctrl" | "primary";
};

export function useKeyboardCommand({
  key,
  onCommand,
  enabled = true,
  modifier,
}: Readonly<KeyboardCommandOptions>) {
  const executeCommand = useEffectEvent(onCommand);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      let hasRequiredModifier = true;
      if (modifier === "ctrl") {
        hasRequiredModifier = event.ctrlKey && !event.metaKey;
      } else if (modifier === "primary") {
        hasRequiredModifier = event.metaKey || event.ctrlKey;
      }

      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.key !== key ||
        !hasRequiredModifier
      ) {
        return;
      }

      event.preventDefault();
      executeCommand();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [enabled, key, modifier]);
}
