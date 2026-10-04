"use client";

import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  useWorkspaceStore,
  selectCustomTestCases,
} from "@/domains/workspace/state/workspace-store";
import { PublicTestCase } from "../models/problem";

type ProblemTestCasesProps = {
  testCases: PublicTestCase[];
};

export default function ProblemTestCases({
  testCases,
}: Readonly<ProblemTestCasesProps>) {
  // Custom test cases mirror the sample cases' parameter shape (same number of
  // inputs, same order) so a user's own values plug into the same function
  // signature, just labeled by position when there's no sample to name them.
  const parameterLabels =
    testCases[0]?.inputs.map((input) => input.valueType) ?? [];
  const parameterCount = Math.max(parameterLabels.length, 1);

  if (testCases.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-y-auto p-4">
        <p className="pb-4 text-sm text-muted-foreground">
          No public test cases available.
        </p>
        <CustomTestCasesPanel
          parameterCount={parameterCount}
          parameterLabels={parameterLabels}
        />
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="case-0"
      className="flex h-full min-h-0 flex-col p-4"
      aria-label="Public test cases"
    >
      <div className="overflow-x-auto pb-1">
        <TabsList>
          {testCases.map((testCase, index) => (
            <TabsTrigger
              key={`${testCase.name}-${index}`}
              value={`case-${index}`}
              className="mr-2 shrink-0"
            >
              Case {index + 1}
            </TabsTrigger>
          ))}
          <TabsTrigger value="custom" className="shrink-0">
            Custom
          </TabsTrigger>
        </TabsList>
      </div>

      {testCases.map((testCase, index) => (
        <TabsContent
          key={`${testCase.name}-panel-${index}`}
          value={`case-${index}`}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <section className="space-y-3 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{testCase.name}</h3>
              <Badge variant="secondary">Case {index + 1}</Badge>
            </div>

            {testCase.description ? (
              <p className="text-sm text-muted-foreground">
                {testCase.description}
              </p>
            ) : null}

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Inputs</h4>
              <div className="space-y-2">
                {testCase.inputs.length > 0 ? (
                  testCase.inputs.map((input, inputIndex) => (
                    <div
                      key={`${input.valueType}-${inputIndex}`}
                      className="rounded-md border bg-background p-3"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Input {inputIndex + 1} ({input.valueType})
                      </p>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-sm">
                        {input.value}
                      </pre>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No inputs provided.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Expected Output</h4>
              <div className="space-y-2">
                {testCase.expectedOutputs.length > 0 ? (
                  testCase.expectedOutputs.map((output, outputIndex) => (
                    <div
                      key={`${output.valueType}-${outputIndex}`}
                      className="rounded-md border bg-background p-3"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Output {outputIndex + 1} ({output.valueType})
                      </p>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-sm">
                        {output.value}
                      </pre>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No expected outputs provided.
                  </p>
                )}
              </div>
            </div>
          </section>
        </TabsContent>
      ))}

      <TabsContent value="custom" className="min-h-0 flex-1 overflow-y-auto">
        <CustomTestCasesPanel
          parameterCount={parameterCount}
          parameterLabels={parameterLabels}
        />
      </TabsContent>
    </Tabs>
  );
}

type CustomTestCasesPanelProps = {
  /** How many input fields each custom case gets. */
  parameterCount: number;
  /** Value-type hints from the first sample case, matched by position. Purely
   *  a label to help the user know what goes where, not enforced. */
  parameterLabels: string[];
};

/**
 * Lets a user author their own test case inputs for Run, separate from the
 * hidden/random pool Submit always uses. Kept in the shared workspace store
 * (not local state) so the Run button, which lives in a sibling header
 * component, can read the current cases when the user clicks it.
 */
function CustomTestCasesPanel({
  parameterCount,
  parameterLabels,
}: Readonly<CustomTestCasesPanelProps>) {
  const customTestCases = useWorkspaceStore(selectCustomTestCases);
  const addCustomTestCase = useWorkspaceStore((s) => s.addCustomTestCase);
  const removeCustomTestCase = useWorkspaceStore((s) => s.removeCustomTestCase);
  const updateCustomTestCaseInput = useWorkspaceStore(
    (s) => s.updateCustomTestCaseInput
  );

  return (
    <section className="space-y-3 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">Custom Test Cases</h3>
          <p className="text-sm text-muted-foreground">
            Run your code against your own inputs. This never runs the hidden or
            random test cases used for grading.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => addCustomTestCase(parameterCount)}
        >
          <Plus size={14} /> Add Test Case
        </Button>
      </div>

      {customTestCases.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No custom test cases yet. Add one to try your own input.
        </p>
      ) : (
        <div className="space-y-3">
          {customTestCases.map((testCase, caseIndex) => (
            <div
              key={caseIndex}
              className="space-y-2 rounded-md border bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Custom {caseIndex + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove custom test case ${caseIndex + 1}`}
                  onClick={() => removeCustomTestCase(caseIndex)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {testCase.inputs.map((value, inputIndex) => {
                  const inputId = `custom-${caseIndex}-${inputIndex}`;
                  const label = parameterLabels[inputIndex]
                    ? `Input ${inputIndex + 1} (${parameterLabels[inputIndex]})`
                    : `Input ${inputIndex + 1}`;

                  return (
                    <div key={inputIndex} className="space-y-1">
                      <Label
                        htmlFor={inputId}
                        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        {label}
                      </Label>
                      <Input
                        id={inputId}
                        value={value}
                        placeholder="e.g. [2,7,11,15]"
                        onChange={(e) =>
                          updateCustomTestCaseInput(
                            caseIndex,
                            inputIndex,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
