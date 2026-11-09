import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Upload } from "lucide-react";
import StudioProblemTitleField from "./fields/studio-problem-title-field";
import StudioProblemQuestionField from "./fields/studio-problem-question-field";
import StudioProblemDifficultyField from "./fields/studio-problem-difficulty-field";
import StudioProblemTimeLimitField from "./fields/studio-problem-time-limit-field";
import StudioProblemMemoryLimitField from "./fields/studio-problem-memory-limit-field";

export default function StudioProblemNewMetadata() {
  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>New Problem</CardTitle>
        <Button variant="secondary">
          <Upload className="me-1" />
          Upload JSON
        </Button>
      </CardHeader>
      <CardContent className="@container space-y-4">
        <StudioProblemTitleField />
        <StudioProblemQuestionField />
        <div className="grid gap-4 @md:grid-cols-3">
          <StudioProblemDifficultyField />
          <StudioProblemTimeLimitField />
          <StudioProblemMemoryLimitField />
        </div>
      </CardContent>
    </Card>
  );
}
