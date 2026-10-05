import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InfinitePaginatedList, PaginationList } from "./pagination-list";

type Item = { id: string; name: string };

const items: Item[] = [
  { id: "1", name: "Alpha" },
  { id: "2", name: "Bravo" },
];

describe("PaginationList", () => {
  it("renders the skeleton while loading", () => {
    render(
      <PaginationList
        items={items}
        isLoading
        skeleton={<p>Loading skeleton</p>}
        emptyComponent={<p>Empty</p>}
        getKey={(item) => item.id}
        renderItem={(item) => <p key={item.id}>{item.name}</p>}
      />
    );

    expect(screen.getByText("Loading skeleton")).toBeVisible();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("renders the empty component when there are no items", () => {
    render(
      <PaginationList
        items={[]}
        emptyComponent={<p>Nothing here</p>}
        getKey={(item: Item) => item.id}
        renderItem={(item: Item) => <p key={item.id}>{item.name}</p>}
      />
    );

    expect(screen.getByText("Nothing here")).toBeVisible();
  });

  it("renders every item", () => {
    render(
      <PaginationList
        items={items}
        getKey={(item) => item.id}
        renderItem={(item) => <p>{item.name}</p>}
      />
    );

    expect(screen.getByText("Alpha")).toBeVisible();
    expect(screen.getByText("Bravo")).toBeVisible();
  });
});

describe("InfinitePaginatedList", () => {
  it("renders the skeleton while fetching the first page", () => {
    render(
      <InfinitePaginatedList
        items={[]}
        hasMore
        isFetching
        onNext={vi.fn()}
        skeleton={<p>Loading skeleton</p>}
        getKey={(item: Item) => item.id}
        renderItem={(item: Item) => <p>{item.name}</p>}
      />
    );

    expect(screen.getByText("Loading skeleton")).toBeVisible();
  });

  it("renders the empty component when there are no items and it is done fetching", () => {
    render(
      <InfinitePaginatedList
        items={[]}
        hasMore={false}
        isFetching={false}
        onNext={vi.fn()}
        emptyComponent={<p>No results</p>}
        getKey={(item: Item) => item.id}
        renderItem={(item: Item) => <p>{item.name}</p>}
      />
    );

    expect(screen.getByText("No results")).toBeVisible();
  });

  it("renders every item inside the infinite scroll container", () => {
    render(
      <InfinitePaginatedList
        items={items}
        hasMore={false}
        isFetching={false}
        onNext={vi.fn()}
        getKey={(item) => item.id}
        renderItem={(item) => <p>{item.name}</p>}
      />
    );

    expect(screen.getByText("Alpha")).toBeVisible();
    expect(screen.getByText("Bravo")).toBeVisible();
  });
});
