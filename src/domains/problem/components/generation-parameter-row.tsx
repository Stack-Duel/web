"use client";

import { memo } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { GenerationParameter } from "../models/generation-parameters";
import {
  GENERATION_VALUE_TYPES,
  constraintsForValueType,
  supportsConstraint,
} from "../models/generation-value-types";
import {
  selectParameter,
  useGenerationParametersStore,
} from "./generation-parameters-store";

const toNumberOrNull = (value: string) =>
  value.trim() === "" ? null : Number(value);

export type GenerationParameterRowProps = {
  id: string;
  isSaving: boolean;
  canRemove: boolean;
  onChange: (id: string, patch: Partial<GenerationParameter>) => void;
  onRemove: (id: string) => void;
};

function GenerationParameterRow({
  id,
  isSaving,
  canRemove,
  onChange,
  onRemove,
}: Readonly<GenerationParameterRowProps>) {
  const parameter = useGenerationParametersStore(selectParameter(id));
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const constraints = constraintsForValueType(parameter.valueType);

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "z-10 opacity-80 shadow-lg")}
    >
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="mb-2 cursor-grab touch-none text-muted-foreground hover:text-foreground"
            aria-label={`Reorder ${parameter.name || "parameter"}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor={`param-name-${id}`}>Name</Label>
            <Input
              id={`param-name-${id}`}
              value={parameter.name}
              placeholder="e.g. nums"
              onChange={(e) => onChange(id, { name: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <div className="w-40 space-y-1.5">
            <Label htmlFor={`param-type-${id}`}>Type</Label>
            <Select
              value={parameter.valueType}
              onValueChange={(valueType) => onChange(id, { valueType })}
              disabled={isSaving}
            >
              <SelectTrigger id={`param-type-${id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENERATION_VALUE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(id)}
            disabled={isSaving || !canRemove}
            aria-label="Remove parameter"
          >
            <Trash2 size={16} />
          </Button>
        </div>

        {constraints.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {parameter.valueType} takes no range or length constraints.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {supportsConstraint(parameter.valueType, "min") && (
              <div className="space-y-1.5">
                <Label htmlFor={`param-min-${id}`}>Min</Label>
                <Input
                  id={`param-min-${id}`}
                  type="number"
                  value={parameter.min ?? ""}
                  onChange={(e) =>
                    onChange(id, { min: toNumberOrNull(e.target.value) })
                  }
                  disabled={isSaving}
                />
              </div>
            )}
            {supportsConstraint(parameter.valueType, "max") && (
              <div className="space-y-1.5">
                <Label htmlFor={`param-max-${id}`}>Max</Label>
                <Input
                  id={`param-max-${id}`}
                  type="number"
                  value={parameter.max ?? ""}
                  onChange={(e) =>
                    onChange(id, { max: toNumberOrNull(e.target.value) })
                  }
                  disabled={isSaving}
                />
              </div>
            )}
            {supportsConstraint(parameter.valueType, "lengthMin") && (
              <div className="space-y-1.5">
                <Label htmlFor={`param-length-min-${id}`}>Length min</Label>
                <Input
                  id={`param-length-min-${id}`}
                  type="number"
                  value={parameter.lengthMin ?? ""}
                  onChange={(e) =>
                    onChange(id, { lengthMin: toNumberOrNull(e.target.value) })
                  }
                  disabled={isSaving}
                />
              </div>
            )}
            {supportsConstraint(parameter.valueType, "lengthMax") && (
              <div className="space-y-1.5">
                <Label htmlFor={`param-length-max-${id}`}>Length max</Label>
                <Input
                  id={`param-length-max-${id}`}
                  type="number"
                  value={parameter.lengthMax ?? ""}
                  onChange={(e) =>
                    onChange(id, { lengthMax: toNumberOrNull(e.target.value) })
                  }
                  disabled={isSaving}
                />
              </div>
            )}
            {supportsConstraint(parameter.valueType, "charset") && (
              <div className="space-y-1.5">
                <Label htmlFor={`param-charset-${id}`}>Charset</Label>
                <Input
                  id={`param-charset-${id}`}
                  value={parameter.charset ?? ""}
                  onChange={(e) =>
                    onChange(id, { charset: e.target.value || null })
                  }
                  disabled={isSaving}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(GenerationParameterRow);
