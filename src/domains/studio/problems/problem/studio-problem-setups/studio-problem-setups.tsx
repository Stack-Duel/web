"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
import { useSuspenseStudioProblemSetups } from "../../../api/get-studio-problem-setups";

type StudioProblemSetupsProps = {
  problemId: string;
};

export default function StudioProblemSetups({
  problemId,
}: Readonly<StudioProblemSetupsProps>) {
  const { data } = useSuspenseStudioProblemSetups({ problemId });

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No language setups configured for this problem.
      </p>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {data.map((setup) => (
        <AccordionItem key={setup.languageVersionId} value={setup.languageVersionId}>
          <AccordionTrigger>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {setup.language} {setup.languageVersion}
              </span>
              {setup.functionName && (
                <Badge variant="outline">{setup.functionName}</Badge>
              )}
              {setup.referenceSolution && (
                <Badge variant="secondary">Reference solution</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Test suites
                </p>
                <p className="mt-1 text-sm">{setup.amountOfTestSuites}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Test cases
                </p>
                <p className="mt-1 text-sm">{setup.amountOfTestCases}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Starter code
              </p>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs">
                {setup.starterCode}
              </pre>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
