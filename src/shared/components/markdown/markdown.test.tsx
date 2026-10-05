import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Markdown } from "./markdown";

describe("Markdown", () => {
  it("renders headings, paragraphs, and lists", () => {
    render(<Markdown content={"# Title\n\nSome text.\n\n- one\n- two"} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Title" })
    ).toBeVisible();
    expect(screen.getByText("Some text.")).toBeVisible();
    expect(screen.getByRole("list")).toBeVisible();
    expect(screen.getByText("one")).toBeVisible();
    expect(screen.getByText("two")).toBeVisible();
  });

  it("renders GFM tables via remark-gfm", () => {
    const table = "| A | B |\n| --- | --- |\n| 1 | 2 |";

    render(<Markdown content={table} />);

    expect(screen.getByRole("table")).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "A" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "1" })).toBeVisible();
  });

  it("sanitizes raw script tags out of the content", () => {
    render(<Markdown content={"before<script>window.x = 1;</script>after"} />);

    expect(screen.getByText(/before/)).toBeVisible();
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });

  it("renders inline code as a styled pill, not plain text", () => {
    render(<Markdown content={"Use `foo()` to start."} />);

    const inlineCode = screen.getByText("foo()");
    expect(inlineCode.tagName).toBe("CODE");
    expect(inlineCode).toHaveClass("bg-muted");
  });

  it("renders fenced code blocks with a syntax-highlighted editor", () => {
    const { container } = render(
      <Markdown content={"```python\nprint('hi')\n```"} />
    );

    expect(container.querySelector(".cm-editor")).not.toBeNull();
    expect(screen.getByText("print('hi')")).toBeInTheDocument();
  });

  it("renders fenced code blocks with no language tag without crashing", () => {
    const { container } = render(<Markdown content={"```\nplain text\n```"} />);

    expect(container.querySelector(".cm-editor")).not.toBeNull();
    expect(screen.getByText("plain text")).toBeInTheDocument();
  });

  it("renders h3 through h6 headings", () => {
    render(
      <Markdown
        content={"### Three\n\n#### Four\n\n##### Five\n\n###### Six"}
      />
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Three" })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 4, name: "Four" })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 5, name: "Five" })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 6, name: "Six" })
    ).toBeVisible();
  });

  it("renders ordered lists", () => {
    render(<Markdown content={"1. first\n2. second"} />);

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(screen.getByText("first")).toBeVisible();
  });

  it("renders links", () => {
    render(<Markdown content={"[docs](https://example.com)"} />);

    const link = screen.getByRole("link", { name: "docs" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveClass("underline");
  });

  it("renders images with alt text and no overflow", () => {
    render(<Markdown content={"![a diagram](https://example.com/x.png)"} />);

    const image = screen.getByAltText("a diagram");
    expect(image).toHaveAttribute("src", "https://example.com/x.png");
    expect(image).toHaveClass("max-w-full");
  });

  it("renders a horizontal rule", () => {
    const { container } = render(
      <Markdown content={"above\n\n---\n\nbelow"} />
    );

    expect(container.querySelector("hr")).not.toBeNull();
  });

  it("renders strikethrough text via GFM", () => {
    render(<Markdown content={"~~old~~"} />);

    expect(screen.getByText("old").tagName).toBe("DEL");
  });

  it("renders task list checkboxes reflecting checked state", () => {
    render(<Markdown content={"- [x] done\n- [ ] todo"} />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).not.toBeChecked();
  });
});
