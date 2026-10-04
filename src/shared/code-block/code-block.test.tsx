import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CodeBlock from "./code-block";

describe("CodeBlock", () => {
  it("renders a read-only CodeMirror editor with the given code", () => {
    const { container } = render(
      <CodeBlock code="print('hi')" language="python" />
    );

    expect(container.querySelector(".cm-editor")).not.toBeNull();
    expect(screen.getByText("print('hi')")).toBeInTheDocument();
  });
});
