"use client";

import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { getLanguageExtensionsByName } from "@/domains/workspace/solution-editor/extensions/language-extension-map";

type CodeBlockProps = {
  code: string;
  language: string;
  className?: string;
};

export default function CodeBlock({
  code,
  language,
  className,
}: Readonly<CodeBlockProps>) {
  const { resolvedTheme } = useTheme();
  const [languageExtensions, setLanguageExtensions] = useState<Extension[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const extensions = await getLanguageExtensionsByName(language);
      if (!cancelled) {
        setLanguageExtensions(extensions);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [language]);

  return (
    <CodeMirror
      value={code}
      editable={false}
      readOnly
      theme={resolvedTheme === "dark" ? vscodeDark : vscodeLight}
      extensions={languageExtensions}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
      }}
      className={cn(
        "overflow-hidden rounded-md border text-sm [&_.cm-editor]:bg-transparent",
        className
      )}
    />
  );
}
