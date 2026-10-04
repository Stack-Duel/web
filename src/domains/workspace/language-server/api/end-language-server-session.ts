import { http } from "@/shared/lib/http";

export const endLanguageServerSession = (sessionId: string) =>
  http.delete<void>(`/api/v1/language-servers/sessions/${sessionId}`);
