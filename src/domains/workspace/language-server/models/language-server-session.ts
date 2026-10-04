export type LanguageServerSession = {
  sessionId: string;
  rootUri: string;
  documentUri: string;
  languageId: string;
  initializationOptions: unknown;
};
