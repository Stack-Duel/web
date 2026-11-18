"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent } from "@/shared/components/ui/tabs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { StudioProblemDetails } from "@/domains/studio/models/studio-problem-details";
import StudioProblemEditMetadata from "./studio-problem-edit-metadata";
import StudioProblemEditSetups from "./setups/studio-problem-edit-setups";
import StudioProblemEditGenerationParameters from "./generation/studio-problem-edit-generation-parameters";
import StudioProblemEditSampleCases from "./sample-cases/studio-problem-edit-sample-cases";
import StudioProblemEditSectionNav, {
  EDIT_SECTIONS,
  type EditSection,
} from "./studio-problem-edit-section-nav";

const DEFAULT_SECTION: EditSection = "details";

function toSection(value: string | null): EditSection {
  return EDIT_SECTIONS.some((section) => section.id === value)
    ? (value as EditSection)
    : DEFAULT_SECTION;
}

export default function StudioProblemEditTabs({
  details,
}: Readonly<{ details: StudioProblemDetails }>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = toSection(searchParams.get("section"));

  const handleSectionChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("section", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="@container min-w-0">
      <Tabs
        orientation="vertical"
        value={section}
        onValueChange={handleSectionChange}
        className="grid min-w-0 gap-4 @4xl:grid-cols-[232px_minmax(0,1fr)]"
      >
        <div className="min-w-0">
          <StudioProblemEditSectionNav
            problemId={details.problemId}
            readiness={details.publishReadiness}
          />
        </div>

        <div className="min-w-0">
          <TabsContent value="details" className="mt-0">
            <StudioProblemEditMetadata
              problemId={details.problemId}
              trackId={details.trackId}
            />
          </TabsContent>

          <TabsContent value="setups" className="mt-0">
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <StudioProblemEditSetups
                problemId={details.problemId}
                trackId={details.trackId}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="sample-cases" className="mt-0">
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <StudioProblemEditSampleCases problemId={details.problemId} />
            </Suspense>
          </TabsContent>

          <TabsContent
            value="generation"
            className="mt-0"
            forceMount
            hidden={section !== "generation"}
          >
            <StudioProblemEditGenerationParameters details={details} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
