"use client";

import { useMemo, useState } from "react";
import { CodeXml } from "lucide-react";
import { EditorWindowTabNode } from "@/domains/workspace/editor-window/state/editor-window-store";
import { WorkspaceEditorWindow } from "@/domains/workspace/editor-window/workspace-editor-window";
import SolutionEditor from "@/domains/workspace/solution-editor/components/solution-editor";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import type { GameWorkspaceProps } from "../../models/game-workspace";
import LobbyPanel from "./lobby-panel";

const PLACEHOLDER_CODE =
  "// Your solution will appear here once the game starts.";

/**
 * The Pending-phase view for multiplayer modes: an empty, read-only editor
 * next to the lobby panel (owner controls, or a waiting message for everyone
 * else) so a lobby is something players can actually see and sit in, instead
 * of a dead end. Rendered by MultiplayerWorkspace only while the game hasn't
 * started. Once Running, that switches to the shared RampWorkspace instead.
 */
export default function LobbyWorkspace({ game }: Readonly<GameWorkspaceProps>) {
  const [placeholderCode] = useState(PLACEHOLDER_CODE);
  const isMobile = useIsMobile();

  const tabs = useMemo((): EditorWindowTabNode => {
    const codeTab: EditorWindowTabNode = {
      key: "code",
      name: "Code",
      icon: (
        <CodeXml size={16} className="text-green-600 dark:text-green-400" />
      ),
      component: <SolutionEditor value={placeholderCode} editable={false} />,
    };

    const lobbyTab: EditorWindowTabNode = {
      key: "lobby",
      name: "Lobby",
      component: <LobbyPanel game={game} />,
    };

    if (isMobile) {
      return { children: [lobbyTab, codeTab] };
    }

    return {
      orientation: "horizontal",
      children: [
        { ...codeTab, defaultSize: 65 },
        { ...lobbyTab, defaultSize: 35 },
      ],
    };
  }, [game, isMobile, placeholderCode]);

  return (
    <div className="h-full min-h-0">
      <WorkspaceEditorWindow tabs={tabs} />
    </div>
  );
}
