import React, { ReactNode } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

export interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  isLoading?: boolean;
  skeleton?: ReactNode;
  emptyComponent?: ReactNode;
  getKey: (item: T) => string | number;
}

export function PaginationList<T>({
  items,
  renderItem,
  isLoading,
  skeleton,
  emptyComponent,
  getKey,
}: Readonly<ListProps<T>>) {
  if (isLoading) {
    return <>{skeleton}</>;
  }
  if (!items.length) {
    return <>{emptyComponent}</>;
  }
  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={getKey(item)}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </>
  );
}

interface InfinitePaginatedListProps<T> {
  items: T[];
  hasMore: boolean;
  isFetching: boolean;
  onNext: () => void;
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string | number;
  emptyComponent?: ReactNode;
  skeleton?: ReactNode;
  loader?: ReactNode;
  endMessage?: ReactNode;
  className?: string;
  scrollableTarget?: string;
}

export function InfinitePaginatedList<T>({
  items,
  hasMore,
  isFetching,
  onNext,
  renderItem,
  getKey,
  emptyComponent,
  skeleton,
  loader = (
    <p className="text-muted-foreground py-3 text-center text-sm">Loading…</p>
  ),
  endMessage,
  className = "flex flex-col gap-3",
  scrollableTarget,
}: Readonly<InfinitePaginatedListProps<T>>) {
  if (isFetching && items.length === 0) return <>{skeleton}</>;
  if (!isFetching && items.length === 0) return <>{emptyComponent ?? null}</>;

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={() => !isFetching && onNext()}
      hasMore={hasMore}
      loader={loader}
      endMessage={endMessage}
      scrollableTarget={scrollableTarget}
      style={{ overflow: "visible" }}
    >
      <div className={className}>
        {items.map((item) => (
          <div key={getKey(item)}>{renderItem(item)}</div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
