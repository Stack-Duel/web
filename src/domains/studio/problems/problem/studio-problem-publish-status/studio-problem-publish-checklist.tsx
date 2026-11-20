"use client";

import { Alert } from "@/shared/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Check, Info, X } from "lucide-react";
import Link from "next/link";
import { useSuspenseStudioProblemDetails } from "../../../api/get-studio-problem";
import { StudioProblemPublishReadiness } from "../../../models/studio-problem-publish-readiness";
import { routerConfig } from "@/shared/router-config";
import StudioProblemSubmitForValidationButton from "../studio-problem-submit-for-validation-button";

type StudioProblemPublishChecklistProps = {
  id: string;
};

type Requirement = {
  met: boolean;
  label: React.ReactNode;
  action?: { label: string; href: string };
};

function formatLanguageList(languages: string[]) {
  if (languages.length <= 1) {
    return languages.join("");
  }

  return `${languages.slice(0, -1).join(", ")} and ${languages.at(-1)}`;
}

function describeLastAttempt(readiness: StudioProblemPublishReadiness) {
  if (readiness.attemptCount === 0 || !readiness.lastSubmittedAt) {
    return "never submitted";
  }

  const submittedAt = new Date(readiness.lastSubmittedAt).toLocaleString();

  return `attempt ${readiness.attemptCount} submitted ${submittedAt}`;
}

function buildRequirements(
  readiness: StudioProblemPublishReadiness,
  problemId: string
): Requirement[] {
  const missingLanguages = readiness.languagesMissingReferenceSolution;
  const editHref = (section: string) =>
    routerConfig.studioProblemEdit.execute({ id: problemId, section });

  return [
    {
      met: readiness.setupCount > 0,
      label:
        readiness.setupCount > 0
          ? `${readiness.setupCount} language setups added`
          : "No language setups added yet",
      action:
        readiness.setupCount > 0
          ? undefined
          : { label: "Open Setups", href: editHref("setups") },
    },
    {
      met: readiness.sampleTestCaseCount > 0,
      label:
        readiness.sampleTestCaseCount > 0
          ? `${readiness.sampleTestCaseCount} sample test cases authored`
          : "No sample test cases authored yet",
      action:
        readiness.sampleTestCaseCount > 0
          ? undefined
          : { label: "Open Sample cases", href: editHref("sample-cases") },
    },
    {
      met: readiness.setupCount > 0 && missingLanguages.length === 0,
      label:
        missingLanguages.length > 0 ? (
          <>
            Reference solution missing for{" "}
            <b>{formatLanguageList(missingLanguages)}</b>
          </>
        ) : (
          "Every language setup has a reference solution"
        ),
      action:
        missingLanguages.length > 0
          ? { label: "Open Setups", href: editHref("setups") }
          : undefined,
    },
    {
      met: readiness.hasGenerationParameters,
      label: readiness.hasGenerationParameters
        ? "Generation parameters set"
        : "Generation parameters not set, needed to build the hidden test cases",
      action: readiness.hasGenerationParameters
        ? undefined
        : { label: "Open Generation", href: editHref("generation") },
    },
  ];
}

export default function StudioProblemPublishChecklist({
  id,
}: Readonly<StudioProblemPublishChecklistProps>) {
  const { data } = useSuspenseStudioProblemDetails({ problemId: id });
  const readiness = data.publishReadiness;

  if (!readiness) {
    return null;
  }

  const requirements = buildRequirements(readiness, id);

  return (
    <Card>
      <CardHeader className="flex items-center gap-3">
        <div>
          <CardTitle>Ready to publish?</CardTitle>
          <CardDescription>
            {readiness.requirementsMet} of {readiness.requirementCount}{" "}
            requirements met &middot; {describeLastAttempt(readiness)}
          </CardDescription>
        </div>
        <StudioProblemSubmitForValidationButton
          className="ml-auto"
          problemId={id}
          isRepublish={readiness.hasUnpublishedChanges}
          isDisabled={!readiness.isReady || !readiness.canSubmit}
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {readiness.hasUnpublishedChanges && (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
            This problem has edits that are not live yet. People solving it
            still see the published version until you publish your changes.
          </p>
        )}
        <div className="grid grid-cols-[auto_1fr] gap-x-3">
          {requirements.map((requirement, index) => (
            <div
              key={index}
              className="col-span-2 grid grid-cols-subgrid items-start border-dashed py-2 not-last:border-b"
            >
              {requirement.met ? (
                <Check className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
              ) : (
                <X className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <div className="flex flex-col items-start gap-1">
                <p>{requirement.label}</p>
                {requirement.action && (
                  <Link
                    href={requirement.action.href}
                    className="text-sm text-sky-600 underline underline-offset-4 dark:text-sky-400"
                  >
                    {requirement.action.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        {readiness.lastFailureReason && (
          <Alert variant="destructive">
            <Info />
            <span>{readiness.lastFailureReason}</span>
          </Alert>
        )}
        <Alert variant="default">
          <Info />
          <span>
            Submitting locks editing until validation finishes. It usually takes
            under two minutes.
          </span>
        </Alert>
      </CardContent>
    </Card>
  );
}
