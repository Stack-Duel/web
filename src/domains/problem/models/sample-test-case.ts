export interface SampleTestCaseInput {
  value: string;
  valueType: string;
}

export interface SampleTestCase {
  id?: string;
  name: string | null;
  inputs: SampleTestCaseInput[];
  expectedOutputValue: string;
  expectedOutputValueType: string;
}
