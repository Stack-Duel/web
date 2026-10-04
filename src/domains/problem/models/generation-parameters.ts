export interface GenerationParameter {
  name: string;
  valueType: string;
  min: number | null;
  max: number | null;
  lengthMin: number | null;
  lengthMax: number | null;
  charset: string | null;
}
