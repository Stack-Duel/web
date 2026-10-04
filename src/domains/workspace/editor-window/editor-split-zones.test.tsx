import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shared/components/ui/resizable";
import {
  BoundaryAwareHandle,
  EditorWindowOuterZones,
  EditorWindowSplitZones,
} from "./editor-split-zones";

const mockUseDndContext = vi.fn();
const mockUseDroppable = vi.fn();

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    useDndContext: () => mockUseDndContext(),
    useDroppable: (...args: unknown[]) => mockUseDroppable(...args),
  };
});

describe("EditorWindowSplitZones", () => {
  it("renders nothing when no drag is active", () => {
    mockUseDndContext.mockReturnValue({ active: null });
    mockUseDroppable.mockReturnValue({ setNodeRef: vi.fn(), isOver: false });

    const { container } = render(<EditorWindowSplitZones groupId="g1" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders every edge zone while a drag is active", () => {
    mockUseDndContext.mockReturnValue({ active: { id: "tab:foo" } });
    mockUseDroppable.mockReturnValue({ setNodeRef: vi.fn(), isOver: false });

    render(<EditorWindowSplitZones groupId="g1" />);

    expect(screen.getByTestId("split-zone-top")).toBeInTheDocument();
    expect(screen.getByTestId("split-zone-right")).toBeInTheDocument();
    expect(screen.getByTestId("split-zone-bottom")).toBeInTheDocument();
    expect(screen.getByTestId("split-zone-left")).toBeInTheDocument();
  });

  it("shows the active-highlight overlay only for an edge being hovered", () => {
    mockUseDndContext.mockReturnValue({ active: { id: "tab:foo" } });
    mockUseDroppable.mockReturnValue({ setNodeRef: vi.fn(), isOver: true });

    const { container } = render(<EditorWindowSplitZones groupId="g1" />);

    expect(container.querySelector(".border-primary\\/60")).toBeInTheDocument();
  });
});

describe("EditorWindowOuterZones", () => {
  it("renders nothing when no drag is active", () => {
    mockUseDndContext.mockReturnValue({ active: null });
    mockUseDroppable.mockReturnValue({ setNodeRef: vi.fn(), isOver: false });

    const { container } = render(<EditorWindowOuterZones />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders every outer boundary zone while a drag is active", () => {
    mockUseDndContext.mockReturnValue({ active: { id: "tab:foo" } });
    mockUseDroppable.mockReturnValue({ setNodeRef: vi.fn(), isOver: false });

    render(<EditorWindowOuterZones />);

    expect(screen.getByTestId("outer-zone-top")).toBeInTheDocument();
    expect(screen.getByTestId("outer-zone-right")).toBeInTheDocument();
    expect(screen.getByTestId("outer-zone-bottom")).toBeInTheDocument();
    expect(screen.getByTestId("outer-zone-left")).toBeInTheDocument();
  });

  it("highlights an outer zone being hovered", () => {
    mockUseDndContext.mockReturnValue({ active: { id: "tab:foo" } });
    mockUseDroppable.mockReturnValue({ setNodeRef: vi.fn(), isOver: true });

    render(<EditorWindowOuterZones />);

    expect(screen.getByTestId("outer-zone-top")).toHaveClass("border-primary");
  });
});

describe("BoundaryAwareHandle", () => {
  function renderHandle() {
    return render(
      <ResizablePanelGroup>
        <ResizablePanel id="a">A</ResizablePanel>
        <BoundaryAwareHandle splitId="split-1" index={1} />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizablePanelGroup>
    );
  }

  it("highlights the resize handle while a dragged tab is over it", () => {
    mockUseDroppable.mockReturnValue({ setNodeRef: vi.fn(), isOver: true });

    const { container } = renderHandle();

    expect(
      container.querySelector('[data-slot="resizable-handle"]')
    ).toHaveClass("bg-primary/60");
  });

  it("does not highlight the resize handle when nothing is over it", () => {
    mockUseDroppable.mockReturnValue({ setNodeRef: vi.fn(), isOver: false });

    const { container } = renderHandle();

    expect(
      container.querySelector('[data-slot="resizable-handle"]')
    ).not.toHaveClass("bg-primary/60");
  });
});
