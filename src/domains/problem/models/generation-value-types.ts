export const GENERATION_VALUE_TYPES = [
  "integer",
  "double",
  "boolean",
  "string",
  "integer_array",
] as const;

export type GenerationValueType = (typeof GENERATION_VALUE_TYPES)[number];

export type GenerationConstraint =
  "min" | "max" | "lengthMin" | "lengthMax" | "charset";

const CONSTRAINTS_BY_VALUE_TYPE: Record<string, GenerationConstraint[]> = {
  integer: ["min", "max"],
  double: ["min", "max"],
  boolean: [],
  string: ["lengthMin", "lengthMax", "charset"],
  integer_array: ["min", "max", "lengthMin", "lengthMax"],
};

export function constraintsForValueType(
  valueType: string
): GenerationConstraint[] {
  return CONSTRAINTS_BY_VALUE_TYPE[valueType] ?? ["min", "max"];
}

export function supportsConstraint(
  valueType: string,
  constraint: GenerationConstraint
) {
  return constraintsForValueType(valueType).includes(constraint);
}
