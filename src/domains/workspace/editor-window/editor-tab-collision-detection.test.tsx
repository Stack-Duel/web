import { describe, expect, it, vi } from "vitest";
import type { CollisionDescriptor } from "@dnd-kit/core";
import { collisionDetection } from "./editor-tab";

const mockPointerWithin = vi.fn();
const mockRectIntersection = vi.fn();

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    pointerWithin: (args: unknown) => mockPointerWithin(args),
    rectIntersection: (args: unknown) => mockRectIntersection(args),
  };
});

function collision(id: string): CollisionDescriptor {
  return {
    id,
    data: { droppableContainer: {}, value: 0 },
  } as CollisionDescriptor;
}

describe("collisionDetection", () => {
  it("prefers a group or tab hit over anything else", () => {
    mockPointerWithin.mockReturnValue([
      collision("outer:top"),
      collision("group:g1"),
    ]);

    const result = collisionDetection({} as never);

    expect(result).toEqual([collision("group:g1")]);
  });

  it("falls back to an outer-rim hit when there's no group or tab under the pointer", () => {
    mockPointerWithin.mockReturnValue([
      collision("boundary:s1:0"),
      collision("outer:left"),
    ]);

    const result = collisionDetection({} as never);

    expect(result).toEqual([collision("outer:left")]);
  });

  it("falls back to a boundary hit when there's no group, tab, or outer-rim hit", () => {
    mockPointerWithin.mockReturnValue([collision("boundary:s1:1")]);

    const result = collisionDetection({} as never);

    expect(result).toEqual([collision("boundary:s1:1")]);
  });

  it("returns all pointer collisions when none match a priority prefix", () => {
    const collisions = [collision("something:else")];
    mockPointerWithin.mockReturnValue(collisions);

    const result = collisionDetection({} as never);

    expect(result).toBe(collisions);
  });

  it("falls back to rect intersection when there are no pointer collisions at all", () => {
    mockPointerWithin.mockReturnValue([]);
    const rectResult = [collision("group:fallback")];
    mockRectIntersection.mockReturnValue(rectResult);

    const result = collisionDetection({} as never);

    expect(result).toBe(rectResult);
  });
});
