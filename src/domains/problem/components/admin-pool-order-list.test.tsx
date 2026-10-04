import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminPoolOrderList from "./admin-pool-order-list";
import { useOrderedProblemPoolMembers } from "../api/get-ordered-problem-pool-members";
import { useReorderProblemPool } from "../api/reorder-problem-pool";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("../api/get-ordered-problem-pool-members");
vi.mock("../api/reorder-problem-pool");

const mockUseOrderedProblemPoolMembers = vi.mocked(
  useOrderedProblemPoolMembers
);
const mockUseReorderProblemPool = vi.mocked(useReorderProblemPool);

describe("AdminPoolOrderList", () => {
  it("shows a loading message while the order is being fetched", () => {
    mockUseOrderedProblemPoolMembers.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useOrderedProblemPoolMembers>);
    mockUseReorderProblemPool.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReorderProblemPool>);

    render(<AdminPoolOrderList poolKey="daily-challenge" />);

    expect(screen.getByText("Loading...")).toBeVisible();
  });

  it("prompts to add problems when the pool is empty", () => {
    mockUseOrderedProblemPoolMembers.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useOrderedProblemPoolMembers>);
    mockUseReorderProblemPool.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReorderProblemPool>);

    render(<AdminPoolOrderList poolKey="daily-challenge" />);

    expect(
      screen.getByText("Add problems to this pool to set an order.")
    ).toBeVisible();
  });

  it("renders members in their current order with a disabled save button", () => {
    mockUseOrderedProblemPoolMembers.mockReturnValue({
      data: [
        { id: "p1", title: "Two Sum" },
        { id: "p2", title: "Reverse String" },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useOrderedProblemPoolMembers>);
    mockUseReorderProblemPool.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReorderProblemPool>);

    render(<AdminPoolOrderList poolKey="daily-challenge" />);

    const rows = screen.getAllByRole("row");
    expect(rows[0]).toHaveTextContent("Two Sum");
    expect(rows[1]).toHaveTextContent("Reverse String");
    expect(screen.getByRole("button", { name: "Save order" })).toBeDisabled();
  });
});
