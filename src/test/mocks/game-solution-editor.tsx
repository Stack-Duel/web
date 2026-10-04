type MockSolutionEditorProps = {
  value?: string;
  editable?: boolean;
};

export default function SolutionEditor({
  value,
  editable = true,
}: MockSolutionEditorProps) {
  return (
    <div data-testid="solution-editor" data-editable={String(editable)}>
      {value}
    </div>
  );
}
