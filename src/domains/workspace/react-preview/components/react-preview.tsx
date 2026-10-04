"use client";

import type { PublicTestCase } from "@/domains/problem/models/problem";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { useEffect, useMemo, useRef, useState } from "react";

const OUTGOING_MESSAGE_TYPE = "algowars-preview-code";
const READY_MESSAGE_TYPE = "algowars-preview-ready";
const CODEPREVIEW_ORIGIN = process.env.NEXT_PUBLIC_CODEPREVIEW_ORIGIN;

if (!CODEPREVIEW_ORIGIN) {
  console.error(
    "NEXT_PUBLIC_CODEPREVIEW_ORIGIN is not set. The React component preview is disabled."
  );
}

type PreviewFile = {
  path: string;
  content: string;
};

type ReactPreviewProps = {
  code: string;
  /** The component the harness renders. Matches the grader's convention (a
   *  bare function/declaration by this name, no export needed) so the same
   *  code works for both preview and submission. */
  functionName: string | null;
  /** Sample test cases to choose props from. Only ones with a "props" input
   *  are offered, since only those are meaningful to render here. */
  testCases?: PublicTestCase[];
  /** Extra files the main file can `require("./File")`. Same files that get
   *  submitted for grading, so multi-file problems preview identically to
   *  how they're graded. */
  additionalFiles?: PreviewFile[];
};

function parseProps(testCase: PublicTestCase | undefined): unknown {
  const rawProps = testCase?.inputs.find((i) => i.valueType === "props")?.value;
  if (!rawProps) return {};
  try {
    return JSON.parse(rawProps) as unknown;
  } catch {
    return {};
  }
}

export default function ReactPreview({
  code,
  functionName,
  testCases,
  additionalFiles,
}: Readonly<ReactPreviewProps>) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const debouncedCode = useDebouncedValue(code, 400);

  const propsTestCases = useMemo(
    () =>
      (testCases ?? []).filter((tc) =>
        tc.inputs.some((i) => i.valueType === "props")
      ),
    [testCases]
  );

  const [selectedName, setSelectedName] = useState<string | undefined>(
    undefined
  );

  const selectedTestCase =
    propsTestCases.find((tc) => tc.name === selectedName) ?? propsTestCases[0];

  const props = useMemo(() => parseProps(selectedTestCase), [selectedTestCase]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.origin !== CODEPREVIEW_ORIGIN) return;
      if (
        typeof event.data === "object" &&
        event.data !== null &&
        event.data.type === READY_MESSAGE_TYPE
      ) {
        setIsReady(true);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const debouncedAdditionalFiles = useDebouncedValue(additionalFiles, 400);

  useEffect(() => {
    if (!isReady || !functionName || !CODEPREVIEW_ORIGIN) return;
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: OUTGOING_MESSAGE_TYPE,
        code: debouncedCode,
        functionName,
        props,
        additionalFiles: debouncedAdditionalFiles,
      },
      CODEPREVIEW_ORIGIN
    );
  }, [isReady, debouncedCode, functionName, props, debouncedAdditionalFiles]);

  if (!CODEPREVIEW_ORIGIN) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        React component preview is unavailable right now.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {propsTestCases.length > 0 && (
        <div className="flex items-center gap-2 border-b p-2">
          <span className="text-muted-foreground text-xs">Test case:</span>
          <Select
            value={selectedTestCase?.name}
            onValueChange={setSelectedName}
          >
            <SelectTrigger className="h-8 w-56">
              <SelectValue placeholder="Select a test case" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {propsTestCases.map((testCase) => (
                  <SelectItem key={testCase.name} value={testCase.name}>
                    {testCase.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={`${CODEPREVIEW_ORIGIN}/preview-frame.html`}
        sandbox="allow-scripts allow-same-origin"
        title="React component preview"
        className="h-full w-full flex-1 border-0 bg-white"
      />
    </div>
  );
}
