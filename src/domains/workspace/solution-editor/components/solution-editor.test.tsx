import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SolutionEditor from "./solution-editor";

vi.mock("@/env", () => import("@/test/mocks/env"));

describe("SolutionEditor", () => {
  it("renders a CodeMirror editor with the given value", () => {
    const { container } = render(<SolutionEditor value="print(1)" />);

    expect(container.querySelector(".cm-editor")).not.toBeNull();
    expect(screen.getByText("print(1)")).toBeInTheDocument();
  });
});
