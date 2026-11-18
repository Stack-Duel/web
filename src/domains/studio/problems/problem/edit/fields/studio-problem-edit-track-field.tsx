"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Badge } from "@/shared/components/ui/badge";
import { useInitialStudioProblemSetup } from "@/domains/studio/api/get-initial-studio-problem-setup";

export default function StudioProblemEditTrackField({
  trackId,
}: Readonly<{ trackId: string | null }>) {
  const { data: studioSetup } = useInitialStudioProblemSetup();

  const track = studioSetup?.availableTracks?.find(
    (availableTrack) => availableTrack.id === trackId
  );

  return (
    <Field>
      <FieldLabel htmlFor="studio-problem-track">Track</FieldLabel>
      <div id="studio-problem-track">
        <Badge variant="secondary">{track?.name ?? "No track"}</Badge>
      </div>
      <FieldDescription>
        Decides which languages can be added as setups. Changing it would orphan
        setups from the old track, so it is fixed after creation.
      </FieldDescription>
    </Field>
  );
}
