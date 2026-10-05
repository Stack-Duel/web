import { Badge } from "@/shared/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import ReferenceSolutionEditor from "./reference-solution-editor";
import type { AdminProblemSetup } from "../models/admin-problem";

type AdminProblemSetupsListProps = {
  setups: AdminProblemSetup[];
  problemId?: string;
};

export default function AdminProblemSetupsList({
  setups,
  problemId,
}: Readonly<AdminProblemSetupsListProps>) {
  if (setups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No language setups configured for this problem.
      </p>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {setups.map((setup) => (
        <AccordionItem key={setup.id} value={setup.id}>
          <AccordionTrigger>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {setup.languageName} {setup.languageVersion}
              </span>
              <Badge variant="outline">{setup.functionName}</Badge>
              {setup.hasReferenceSolution && (
                <Badge variant="secondary">Reference solution</Badge>
              )}
              {setup.hasGenerationSpec && (
                <Badge variant="secondary">Generation spec</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Test suites
                </p>
                <p className="mt-1 text-sm">{setup.testSuiteCount}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Test cases
                </p>
                <p className="mt-1 text-sm">{setup.testCaseCount}</p>
              </div>
            </div>
            {problemId ? (
              <ReferenceSolutionEditor problemId={problemId} setup={setup} />
            ) : (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Initial code
                </p>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs">
                  {setup.initialCode}
                </pre>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
