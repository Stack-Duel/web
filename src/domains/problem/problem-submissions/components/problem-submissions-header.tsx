import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Problem } from "../../models/problem";
import DifficultyBadge from "../../components/difficulty-badge";
import { Markdown } from "@/shared/components/markdown/markdown";
import { ProblemReactionButtons } from "../../problem-reactions/components/problem-reaction-buttons";

type ProblemSubmissionsHeaderProps = {
  problem: Problem;
} & React.ComponentProps<"div">;

export default function ProblemSubmissionsHeader({
  problem,
  ...props
}: Readonly<ProblemSubmissionsHeaderProps>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{problem.title}</CardTitle>
        <DifficultyBadge difficulty={problem.difficultyTier} />
        <CardAction>
          <ProblemReactionButtons problemId={problem.id} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <Markdown content={problem.question} />
      </CardContent>
    </Card>
  );
}
