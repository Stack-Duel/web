"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import type { Track } from "@/domains/game/models/track";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

export default function StudioProblemTrackField({
  field,
  availableTracks,
}: Readonly<{ field: AnyFieldApi; availableTracks: Track[] }>) {
  const setTrackId = useNewStudioProblemStore((state) => state.setTrackId);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Track</FieldLabel>
      <Select
        value={field.state.value}
        onValueChange={(value) => {
          field.handleChange(value);
          setTrackId(value);
          field.handleBlur();
        }}
      >
        <SelectTrigger
          id={field.name}
          className="w-full"
          aria-invalid={isInvalid}
        >
          <SelectValue placeholder="Select a track" />
        </SelectTrigger>
        <SelectContent>
          {availableTracks.map((track) => (
            <SelectItem key={track.id} value={track.id}>
              {track.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
