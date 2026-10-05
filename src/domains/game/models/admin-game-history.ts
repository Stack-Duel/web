export enum AdminGameHistoryEventType {
  Accepted = "Accepted",
  WrongAnswer = "WrongAnswer",
  Skipped = "Skipped",
}

export interface AdminGameHistoryEvent {
  type: AdminGameHistoryEventType;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  occurredAt: string | null;
  submissionId: string | null;
  languageName: string | null;
}

export interface AdminGamePlayerHistory {
  userId: string;
  events: AdminGameHistoryEvent[];
}
