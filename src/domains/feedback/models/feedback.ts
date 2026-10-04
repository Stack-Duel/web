export type FeedbackType = "Bug" | "FeatureRequest" | "Question" | "General";

export type FeedbackStatus =
  "New" | "Triaged" | "InProgress" | "Resolved" | "WontFix";

export type FeedbackContextType = "None" | "Problem" | "Game" | "Submission";

export interface FeedbackUser {
  username: string;
  imageUrl: string | null;
}

export interface AdminFeedbackListItem {
  id: string;
  type: FeedbackType;
  status: FeedbackStatus;
  message: string;
  rating: number | null;
  contextType: FeedbackContextType;
  contextEntityId: string | null;
  user: FeedbackUser;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminFeedbackDetail extends AdminFeedbackListItem {
  adminNote: string | null;
  pageUrl: string | null;
  userAgent: string | null;
}

export interface SubmitFeedbackPayload {
  type: FeedbackType;
  message: string;
  rating: number | null;
  contextType: FeedbackContextType;
  contextEntityId: string | null;
}
