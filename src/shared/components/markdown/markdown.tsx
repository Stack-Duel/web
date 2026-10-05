import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import CodeBlock from "@/shared/code-block/code-block";

type Props = {
  content: string;
};

type CodeElementProps = {
  className?: string;
  children?: ReactNode;
};

const fenceLanguageAliases: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
};

function resolveCodeBlockLanguage(language: string) {
  const key = language.toLowerCase();
  return fenceLanguageAliases[key] ?? key;
}

const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    input: [...(defaultSchema.attributes?.input ?? []), "checked"],
  },
};

export function Markdown({ content }: Props) {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeSanitize, markdownSanitizeSchema]]}
        components={{
          h1: ({ children, ...props }) => (
            <h1
              className="scroll-m-28 mt-8 text-2xl font-bold tracking-tight text-balance first:mt-0"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="scroll-m-28 mt-8 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="scroll-m-28 mt-6 text-lg font-semibold tracking-tight first:mt-0"
              {...props}
            >
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4
              className="scroll-m-28 mt-6 text-base font-semibold tracking-tight first:mt-0"
              {...props}
            >
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5
              className="scroll-m-28 mt-4 text-sm font-semibold tracking-tight first:mt-0"
              {...props}
            >
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6
              className="scroll-m-28 mt-4 text-sm font-medium tracking-tight text-muted-foreground first:mt-0"
              {...props}
            >
              {children}
            </h6>
          ),
          p: ({ ...props }) => (
            <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
          ),
          li: ({ className, ...props }) => (
            <li
              className={
                className?.includes("task-list-item")
                  ? "ml-[-1.5rem] list-none"
                  : undefined
              }
              {...props}
            />
          ),
          a: ({ ...props }) => (
            <a
              className="font-medium underline underline-offset-4"
              {...props}
            />
          ),
          img: ({ alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={alt ?? ""}
              className="my-6 h-auto max-w-full rounded-md"
              {...props}
            />
          ),
          hr: ({ ...props }) => (
            <hr className="my-8 border-border" {...props} />
          ),
          del: ({ ...props }) => (
            <del className="text-muted-foreground" {...props} />
          ),
          input: ({ type, ...props }) =>
            type === "checkbox" ? (
              <input
                type="checkbox"
                disabled
                className="mr-2 h-4 w-4 rounded border-input align-middle accent-primary"
                {...props}
              />
            ) : (
              <input type={type} {...props} />
            ),
          blockquote: ({ ...props }) => (
            <blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />
          ),
          code: ({ children, ...props }) => (
            <code
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => {
            const codeProps = isValidElement<CodeElementProps>(children)
              ? children.props
              : undefined;
            const match = /language-(\w+)/.exec(codeProps?.className ?? "");
            const code = String(codeProps?.children ?? "").replace(/\n$/, "");

            return (
              <CodeBlock
                code={code}
                language={resolveCodeBlockLanguage(match?.[1] ?? "text")}
              />
            );
          },
          table: ({ ...props }) => (
            <div className="my-6 rounded-md border">
              <Table {...props} />
            </div>
          ),
          thead: ({ ...props }) => <TableHeader {...props} />,
          tbody: ({ ...props }) => <TableBody {...props} />,
          tr: ({ ...props }) => <TableRow {...props} />,
          th: ({ ...props }) => <TableHead {...props} />,
          td: ({ ...props }) => <TableCell {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
