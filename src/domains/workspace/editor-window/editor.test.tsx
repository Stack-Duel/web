import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditorWindow } from "./editor";

describe("EditorWindow", () => {
  it("delegates rendering to EditorWindowTab with the given props", () => {
    render(
      <EditorWindow
        tabs={{ name: "Editor", component: <p>Editor content</p> }}
        activeTabByNode={{}}
        onTabActivate={vi.fn()}
      />
    );

    expect(screen.getByText("Editor content")).toBeVisible();
  });
});
