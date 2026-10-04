export interface PageResult<T> {
  results: T[];
  total: number;
  page: number;
  size: number;
  timestamp: string;
  totalPages?: number;
}
