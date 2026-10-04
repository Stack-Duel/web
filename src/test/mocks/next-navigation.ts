import { vi } from "vitest";

export const usePathname = vi.fn(() => "/");

export const searchParamsMock = new URLSearchParams();
export const useSearchParams = vi.fn(() => searchParamsMock);

export const routerMock = {
  back: vi.fn(),
  forward: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const useRouter = vi.fn(() => routerMock);

export class NextRedirectError extends Error {
  constructor(public readonly url: string) {
    super(`NEXT_REDIRECT:${url}`);
  }
}

export class NextNotFoundError extends Error {
  constructor() {
    super("NEXT_NOT_FOUND");
  }
}

export const redirect = vi.fn((url: string) => {
  throw new NextRedirectError(url);
});

export const notFound = vi.fn(() => {
  throw new NextNotFoundError();
});
