"use client";

import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useSuspenseStudioProblemSetups } from "@/domains/studio/api/get-studio-problem-setups";
import type { StudioProblemSetup } from "@/domains/studio/models/studio-problem-setup";
import StudioProblemSetupDeleteButton from "../../studio-problem-setups/studio-problem-setup-delete-button";
import StudioProblemAddLanguageDialog from "./studio-problem-add-language-dialog";
import StudioProblemSetupEditor from "./studio-problem-setup-editor";
import {
  useStudioProblemSetupsStore,
  useStudioProblemSetupsStoreApi,
} from "./studio-problem-setups-store-context";
import { selectSetupIsDirty } from "./studio-problem-setups-store";

type StudioProblemEditSetupsProps = {
  problemId: string;
  trackId: string | null;
};

function UnsavedSetupBadge({
  languageVersionId,
}: Readonly<{ languageVersionId: string }>) {
  const isDirty = useStudioProblemSetupsStore(
    selectSetupIsDirty(languageVersionId)
  );

  if (!isDirty) return null;

  return <Badge variant="outline">Unsaved changes</Badge>;
}

function StudioProblemSetupsList({
  problemId,
  setups,
}: Readonly<{ problemId: string; setups: StudioProblemSetup[] }>) {
  if (setups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No languages configured yet. Add one to provide starter code and a
        reference solution.
      </p>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {setups.map((setup) => (
        <AccordionItem
          key={setup.languageVersionId}
          value={setup.languageVersionId}
        >
          <div className="flex items-center gap-2">
            <AccordionTrigger className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">
                  {setup.language} {setup.languageVersion}
                </span>
                {setup.functionName && (
                  <Badge variant="outline">{setup.functionName}</Badge>
                )}
                {setup.referenceSolution ? (
                  <Badge variant="secondary">Reference solution</Badge>
                ) : (
                  <Badge variant="destructive">Needs reference solution</Badge>
                )}
                <UnsavedSetupBadge
                  languageVersionId={setup.languageVersionId}
                />
              </div>
            </AccordionTrigger>
            <StudioProblemSetupDeleteButton
              problemId={problemId}
              languageVersionId={setup.languageVersionId}
              languageLabel={`${setup.language} ${setup.languageVersion}`}
              testCaseCount={setup.amountOfTestCases}
            />
          </div>
          <AccordionContent>
            <StudioProblemSetupEditor problemId={problemId} setup={setup} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function StudioProblemEditSetups({
  problemId,
  trackId,
}: Readonly<StudioProblemEditSetupsProps>) {
  const { data: setups } = useSuspenseStudioProblemSetups({ problemId });
  const store = useStudioProblemSetupsStoreApi();
  const missingReferenceSolutions = setups.filter(
    (setup) => !setup.referenceSolution
  ).length;

  useEffect(() => {
    store.getState().syncSetupsFromServer(setups);
  }, [store, setups]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle>Language setups</CardTitle>
          <CardDescription>
            One per language a player can solve in. Each needs starter code and
            a reference solution that passes every sample case.
          </CardDescription>
        </div>
        <StudioProblemAddLanguageDialog
          problemId={problemId}
          trackId={trackId}
          existingSetups={setups}
        />
      </CardHeader>
      <CardContent>
        <StudioProblemSetupsList problemId={problemId} setups={setups} />
      </CardContent>
      <CardFooter className="sticky bottom-0 z-10">
        <p className="text-sm text-muted-foreground">
          Each setup saves on its own.
          {missingReferenceSolutions > 0
            ? ` ${missingReferenceSolutions} setup${
                missingReferenceSolutions === 1 ? "" : "s"
              } still need a reference solution.`
            : ""}
        </p>
      </CardFooter>
    </Card>
  );
}
