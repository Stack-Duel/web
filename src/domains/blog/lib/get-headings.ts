import GithubSlugger from "github-slugger";

export type BlogHeading = {
  id: string;
  text: string;
};

function stripMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[(?=([^\]]+))\1\]\((?=([^)]+))\2\)/g, "$1")
    .trim();
}

// rehype-sanitize's default schema prefixes generated heading ids with this
// to prevent DOM-clobbering, so ids here must match to stay in sync.
const ID_PREFIX = "user-content-";

export function getHeadings(markdown: string): BlogHeading[] {
  const slugger = new GithubSlugger();
  const headingPattern = /^#{2,3}\s+(\S.*)$/gm;

  return Array.from(markdown.matchAll(headingPattern)).map((match) => {
    const text = stripMarkdown(match[1]);
    return { id: ID_PREFIX + slugger.slug(text), text };
  });
}
