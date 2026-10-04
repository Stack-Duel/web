import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { toast } from "sonner";
import HealthCheck from "./health-check";
import { useHealth } from "../api/get-health";

vi.mock("../api/get-health", () => ({ useHealth: vi.fn() }));
vi.mock("sonner", () => {
  const toast = vi.fn() as unknown as typeof import("sonner").toast;
  (toast as unknown as { dismiss: ReturnType<typeof vi.fn> }).dismiss = vi.fn();
  return { toast };
});

const mockUseHealth = vi.mocked(useHealth);

describe("HealthCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing", () => {
    mockUseHealth.mockReturnValue({
      isFetching: true,
      isSuccess: false,
      isError: false,
    } as ReturnType<typeof useHealth>);

    const { container } = render(<HealthCheck />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows a slow-startup toast after 5 seconds of still fetching", () => {
    mockUseHealth.mockReturnValue({
      isFetching: true,
      isSuccess: false,
      isError: false,
    } as ReturnType<typeof useHealth>);

    render(<HealthCheck />);
    expect(toast).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);

    expect(toast).toHaveBeenCalledWith(
      "Server is starting up. This may take up to a minute.",
      expect.objectContaining({
        id: "server-startup",
        closeButton: true,
        duration: 60000,
      })
    );
  });

  it("does not show the toast if the fetch settles before 5 seconds", () => {
    mockUseHealth.mockReturnValue({
      isFetching: true,
      isSuccess: false,
      isError: false,
    } as ReturnType<typeof useHealth>);

    const { rerender } = render(<HealthCheck />);

    mockUseHealth.mockReturnValue({
      isFetching: false,
      isSuccess: true,
      isError: false,
    } as ReturnType<typeof useHealth>);
    rerender(<HealthCheck />);

    vi.advanceTimersByTime(5000);

    expect(toast).not.toHaveBeenCalled();
  });

  it("dismisses the toast once the query settles successfully", () => {
    mockUseHealth.mockReturnValue({
      isFetching: false,
      isSuccess: true,
      isError: false,
    } as ReturnType<typeof useHealth>);

    render(<HealthCheck />);

    expect(toast.dismiss).toHaveBeenCalledWith("server-startup");
  });

  it("dismisses the toast once the query settles with an error", () => {
    mockUseHealth.mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: true,
    } as ReturnType<typeof useHealth>);

    render(<HealthCheck />);

    expect(toast.dismiss).toHaveBeenCalledWith("server-startup");
  });
});
