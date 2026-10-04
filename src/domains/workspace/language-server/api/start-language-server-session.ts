import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { LanguageServerSession } from "../models/language-server-session";

export type StartLanguageServerSessionVariables = {
  language: string;
};

export const startLanguageServerSession = ({
  language,
  signal,
}: StartLanguageServerSessionVariables & RequestConfig) =>
  http.post<LanguageServerSession>(
    "/api/v1/language-servers/sessions",
    { language },
    toAxiosConfig({ signal })
  );
