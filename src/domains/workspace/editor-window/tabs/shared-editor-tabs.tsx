import type { ReactNode } from "react";
import { FileText, FlaskConical } from "lucide-react";
import { ProblemQuestion } from "@/domains/problem/components/problem-question";
import ProblemTestCases from "@/domains/problem/components/problem-test-cases";
import SubmissionStatusPanel from "@/domains/submission/components/submission-status-panel";
import type { Problem, PublicTestCase } from "@/domains/problem/models/problem";
import type { EditorWindowTabNode } from "../state/editor-window-store";

export function DescriptionTabIcon() {
  return <FileText size={16} className="text-blue-600 dark:text-blue-400" />;
}

export function FlaskConicalTabIcon() {
  return (
    <FlaskConical size={16} className="text-indigo-600 dark:text-indigo-400" />
  );
}

export function createDescriptionTab({
  key = "description",
  name = "Description",
  problem,
  loadingFallback = null,
}: {
  key?: string;
  name?: string;
  problem: Problem | null | undefined;
  loadingFallback?: ReactNode;
}): EditorWindowTabNode {
  return {
    key,
    name,
    icon: <DescriptionTabIcon />,
    component: problem ? (
      <ProblemQuestion problem={problem} />
    ) : (
      loadingFallback
    ),
  };
}

export function createTestsTab(
  testCases: PublicTestCase[] | undefined
): EditorWindowTabNode {
  return {
    key: "tests",
    name: "Tests",
    icon: <FlaskConicalTabIcon />,
    component: <ProblemTestCases testCases={testCases ?? []} />,
  };
}

export function createSubmissionTab({
  submissionId,
  isSubmitting,
}: {
  submissionId: string | null;
  isSubmitting: boolean;
}): EditorWindowTabNode {
  return {
    key: "submission",
    name: "Submission",
    icon: <FlaskConicalTabIcon />,
    component: (
      <SubmissionStatusPanel
        submissionId={submissionId}
        isSubmitting={isSubmitting}
      />
    ),
  };
}
