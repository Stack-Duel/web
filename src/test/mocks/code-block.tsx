export default function CodeBlock({
  code,
}: {
  code: string;
  language: string;
}) {
  return <pre data-slot="code-block-mock">{code}</pre>;
}
