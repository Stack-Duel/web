import type { FeedbackStatus } from "@/domains/feedback/models/feedback";

export interface DailyUserCount {
  date: string;
  count: number;
}

export interface FeedbackStatusCount {
  status: FeedbackStatus;
  count: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalProblems: number;
  totalGames: number;
  totalSubmissions: number;
  newUsersByDay: DailyUserCount[];
  feedbackByStatus: FeedbackStatusCount[];
}
