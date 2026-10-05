"use client";

import { useEffect, useState } from "react";
import type { Extension } from "@uiw/react-codemirror";
import {
  languageServerWithTransport,
  WebSocketTransport,
} from "codemirror-languageserver";
import { env } from "@/env";
import { getSharedAccessToken } from "@/shared/lib/get-shared-access-token";
import { startLanguageServerSession } from "../api/start-language-server-session";
import { endLanguageServerSession } from "../api/end-language-server-session";

const LSP_ENABLED_LANGUAGES = new Set(["java"]);
const LSP_BRIDGE_PATH = "/hubs/language-server";

const toWebSocketBaseUrl = (httpBaseUrl: string) =>
  httpBaseUrl.replace(/^http/i, "ws");

export function useLanguageServerExtension(
  languageName: string | undefined
): Extension[] {
  const [extensions, setExtensions] = useState<Extension[]>([]);

  useEffect(() => {
    if (
      !languageName ||
      !LSP_ENABLED_LANGUAGES.has(languageName.trim().toLowerCase())
    ) {
      return;
    }

    let cancelled = false;
    let activeSessionId: string | null = null;

    (async () => {
      try {
        const session = await startLanguageServerSession({
          language: languageName,
        });
        if (cancelled) {
          void endLanguageServerSession(session.sessionId);
          return;
        }

        activeSessionId = session.sessionId;

        const accessToken = (await getSharedAccessToken()) ?? "";
        const params = new URLSearchParams({
          sessionId: session.sessionId,
          access_token: accessToken,
        });
        const serverUri = `${toWebSocketBaseUrl(env.NEXT_PUBLIC_API_SERVER_URL)}${LSP_BRIDGE_PATH}?${params.toString()}`;

        if (cancelled) return;

        const transport = new WebSocketTransport(serverUri);
        const ext = languageServerWithTransport({
          transport,
          rootUri: session.rootUri,
          workspaceFolders: [{ uri: session.rootUri, name: "workspace" }],
          documentUri: session.documentUri,
          languageId: session.languageId,
          initializationOptions: session.initializationOptions,
          autoClose: true,
          onError: () => setExtensions([]),
          onClose: () => setExtensions([]),
        });

        setExtensions(ext);
      } catch {
        if (!cancelled) setExtensions([]);
      }
    })();

    return () => {
      cancelled = true;
      setExtensions([]);
      if (activeSessionId) void endLanguageServerSession(activeSessionId);
    };
  }, [languageName]);

  return extensions;
}
