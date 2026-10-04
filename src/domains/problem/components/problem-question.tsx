import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Separator } from "@/shared/components/ui/separator";
import { Copyright, Tag } from "lucide-react";
import DifficultyBadge from "./difficulty-badge";
import { Problem } from "../models/problem";
import { Markdown } from "@/shared/components/markdown/markdown";
import { ProblemReactionButtons } from "../problem-reactions/components/problem-reaction-buttons";
import { ContextFeedbackButton } from "@/domains/feedback/components/context-feedback-button";

type ProblemQuestionProps = {
  problem: Problem;
};

export const ProblemQuestion = ({ problem }: ProblemQuestionProps) => {
  const tags = problem.tags ?? [];
  const authorName = problem.author?.username;
  const hasAuthor = Boolean(authorName);
  const authorInitial = authorName?.[0]?.toUpperCase() ?? "U";
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <div className="space-y-4">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          {problem.title}
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {problem.difficultyTier}
            <DifficultyBadge difficulty={problem.difficultyTier} />
            {hasAuthor ? (
              <div className="flex items-center gap-1.5 text-sm">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={problem.author?.imageUrl ?? undefined}
                    alt={authorName}
                  />
                  <AvatarFallback>{authorInitial}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">
                  {authorName}
                </span>
              </div>
            ) : null}
          </div>

          <ProblemReactionButtons problemId={problem.id} />
        </div>

        <Markdown content={problem.question} />
      </div>

      <div className="mt-auto space-y-3 pt-4">
        <Accordion
          type="single"
          collapsible
          className="rounded-md border bg-muted/20 px-3"
        >
          <AccordionItem value="tags" className="border-b-0">
            <AccordionTrigger className="py-2 text-sm hover:no-underline">
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags ({tags.length})
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="capitalize">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No tags provided.
                  </span>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Copyright className="h-3.5 w-3.5" /> Copyright {currentYear}{" "}
            algowars. All rights reserved.
          </p>
          <ContextFeedbackButton type="Problem" entityId={problem.id} />
        </div>
      </div>
    </div>
  );
};
