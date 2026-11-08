import { Markdown } from "@/shared/components/markdown/markdown";
import { useSuspenseStudioProblemDetails } from "../../api/get-studio-problem";

type StudioProblemQuestionProps = {
  problemId: string;
};

export default function StudioProblemQuestion({
  problemId,
}: StudioProblemQuestionProps) {
  const { data } = useSuspenseStudioProblemDetails({ problemId });

  return <Markdown content={data.question} />;
}
