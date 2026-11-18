"use client";

import { Check, Circle, X } from "lucide-react";
import { TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type { StudioProblemPublishReadiness } from "@/domains/studio/models/studio-problem-publish-readiness";
import { useStudioProblemEditStore } from "./studio-problem-edit-store-context";
import { selectIsDirty } from "./studio-problem-edit-store";
import { useStudioProblemSetupsStore } from "./setups/studio-problem-setups-store-context";
import { selectHasAnyDirtySetup } from "./setups/studio-problem-setups-store";
import StudioProblemSubmitForValidationButton from "../studio-problem-submit-for-validation-button";

export const EDIT_SECTIONS = [
  { id: "details", ordinal: "01", label: "Details" },
  { id: "setups", ordinal: "02", label: "Setups" },
  { id: "sample-cases", ordinal: "03", label: "Sample cases" },
  { id: "generation", ordinal: "04", label: "Generation" },
] as const;

export type EditSection = (typeof EDIT_SECTIONS)[number]["id"];

type SectionState = "dirty" | "missing" | "ok";

function SectionStateMark({ state }: Readonly<{ state: SectionState }>) {
  if (state === "ok") {
    return (
      <Check
        size={12}
        className="ml-auto text-emerald-600 dark:text-emerald-400"
        aria-label="ready"
      />
    );
  }

  if (state === "dirty") {
    return (
      <Circle
        size={8}
        className="ml-auto fill-current text-amber-600 dark:text-amber-500"
        aria-label="unsaved changes"
      />
    );
  }

  return (
    <X
      size={12}
      className="ml-auto text-destructive"
      aria-label="requirements unmet"
    />
  );
}

function sectionRequirementsMet(
  section: EditSection,
  readiness: StudioProblemPublishReadiness | null
) {
  if (!readiness) return false;

  switch (section) {
    case "details":
      return true;
    case "setups":
      return (
        readiness.setupCount > 0 &&
        readiness.languagesMissingReferenceSolution.length === 0
      );
    case "sample-cases":
      return readiness.sampleTestCaseCount > 0;
    case "generation":
      return readiness.hasGenerationParameters;
  }
}

function ReadinessCheck({
  isMet,
  label,
}: Readonly<{ isMet: boolean; label: string }>) {
  return (
    <li className="grid grid-cols-[auto_1fr] items-start gap-2.5 text-[13px]">
      {isMet ? (
        <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
      ) : (
        <X size={13} className="text-destructive" />
      )}
      <span className="text-muted-foreground">{label}</span>
    </li>
  );
}

function Readiness({
  readiness,
}: Readonly<{ readiness: StudioProblemPublishReadiness }>) {
  const missingSolutions = readiness.languagesMissingReferenceSolution.length;

  return (
    <div className="space-y-2 px-2.5 py-2">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
        {readiness.requirementsMet} of {readiness.requirementCount} ready
      </p>
      <ul className="flex flex-col gap-2.5">
        <ReadinessCheck
          isMet={readiness.setupCount > 0}
          label={`${readiness.setupCount} setup${readiness.setupCount === 1 ? "" : "s"}`}
        />
        <ReadinessCheck
          isMet={readiness.sampleTestCaseCount > 0}
          label={`${readiness.sampleTestCaseCount} sample case${
            readiness.sampleTestCaseCount === 1 ? "" : "s"
          }`}
        />
        <ReadinessCheck
          isMet={missingSolutions === 0 && readiness.setupCount > 0}
          label={
            missingSolutions > 0
              ? `${missingSolutions} reference solution${missingSolutions === 1 ? "" : "s"}`
              : "Reference solutions"
          }
        />
        <ReadinessCheck
          isMet={readiness.hasGenerationParameters}
          label="Generation params"
        />
      </ul>
    </div>
  );
}

export default function StudioProblemEditSectionNav({
  problemId,
  readiness,
}: Readonly<{
  problemId: string;
  readiness: StudioProblemPublishReadiness | null;
}>) {
  const isDetailsDirty = useStudioProblemEditStore(selectIsDirty);
  const hasDirtySetup = useStudioProblemSetupsStore(selectHasAnyDirtySetup);

  const dirtyBySection: Record<EditSection, boolean> = {
    details: isDetailsDirty,
    setups: hasDirtySetup,
    "sample-cases": false,
    generation: false,
  };

  const toSectionState = (section: EditSection): SectionState => {
    if (dirtyBySection[section]) return "dirty";
    return sectionRequirementsMet(section, readiness) ? "ok" : "missing";
  };

  return (
    <div className="top-4 flex max-h-[calc(100dvh-6rem)] flex-col gap-1.5 overflow-y-auto rounded-lg border bg-card p-1.5 @4xl:sticky">
      <TabsList className="h-fit w-full flex-col gap-0.5 overflow-x-auto bg-transparent p-0 @4xl:overflow-visible">
        {EDIT_SECTIONS.map((section) => (
          <TabsTrigger
            key={section.id}
            value={section.id}
            className="h-9 w-full justify-start gap-2.5 px-2.5 after:hidden"
          >
            <span className="font-mono text-[11px] text-muted-foreground">
              {section.ordinal}
            </span>
            {section.label}
            <SectionStateMark state={toSectionState(section.id)} />
          </TabsTrigger>
        ))}
      </TabsList>

      {readiness && (
        <>
          <div className="mx-1 border-t" />
          <Readiness readiness={readiness} />
          <div className="px-2.5 pb-1">
            <StudioProblemSubmitForValidationButton
              className="w-full"
              problemId={problemId}
              isDisabled={!readiness.isReady || !readiness.canSubmit}
            />
          </div>
        </>
      )}
    </div>
  );
}
