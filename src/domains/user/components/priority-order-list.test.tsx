import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PriorityOrderList from "./priority-order-list";

const items = [
  { id: "stack_1", name: "Web" },
  { id: "stack_2", name: "Systems" },
  { id: "stack_3", name: "Data" },
];

describe("PriorityOrderList", () => {
  it("renders the items in the given order with a rank number each", () => {
    render(
      <PriorityOrderList
        items={items}
        orderedIds={["stack_2", "stack_1", "stack_3"]}
        onOrderedIdsChange={vi.fn()}
      />
    );

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("1");
    expect(rows[0]).toHaveTextContent("Systems");
    expect(rows[1]).toHaveTextContent("2");
    expect(rows[1]).toHaveTextContent("Web");
    expect(rows[2]).toHaveTextContent("3");
    expect(rows[2]).toHaveTextContent("Data");
  });

  it("skips ordered ids that have no matching item", () => {
    render(
      <PriorityOrderList
        items={items}
        orderedIds={["stack_1", "missing", "stack_2"]}
        onOrderedIdsChange={vi.fn()}
      />
    );

    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Web")).toBeVisible();
    expect(screen.getByText("Systems")).toBeVisible();
  });

  it("exposes a drag handle for every row", () => {
    render(
      <PriorityOrderList
        items={items}
        orderedIds={["stack_1", "stack_2", "stack_3"]}
        onOrderedIdsChange={vi.fn()}
      />
    );

    expect(
      screen.getAllByRole("button", { name: "Drag to reorder" })
    ).toHaveLength(3);
  });
});
