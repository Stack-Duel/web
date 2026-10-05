import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { act } from "@testing-library/react";
import CountdownTimer from "./countdown-timer";

async function advanceOneSecondAtATime(totalSeconds: number) {
  for (let i = 0; i < totalSeconds; i++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
  }
}

describe("CountdownTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the full remaining time as soon as it starts", () => {
    render(
      <CountdownTimer
        startedAt={new Date("2026-01-01T00:00:00.000Z")}
        timeLimitInSeconds={125}
      />
    );

    expect(screen.getByText("2:05")).toBeVisible();
  });

  it("counts down as time passes", async () => {
    render(
      <CountdownTimer
        startedAt={new Date("2026-01-01T00:00:00.000Z")}
        timeLimitInSeconds={125}
      />
    );

    await advanceOneSecondAtATime(5);

    expect(screen.getByText("2:00")).toBeVisible();
  });

  it("marks the time as low once at or below 60 seconds remaining", async () => {
    render(
      <CountdownTimer
        startedAt={new Date("2026-01-01T00:00:00.000Z")}
        timeLimitInSeconds={61}
      />
    );

    expect(screen.getByText("1:01")).not.toHaveClass("text-destructive");

    await advanceOneSecondAtATime(1);

    expect(screen.getByText("1:00")).toHaveClass("text-destructive");
    expect(screen.getByText("1:00")).toHaveClass("animate-pulse");
  });

  it("pulses more urgently once at or below 10 seconds remaining", async () => {
    render(
      <CountdownTimer
        startedAt={new Date("2026-01-01T00:00:00.000Z")}
        timeLimitInSeconds={11}
      />
    );

    expect(screen.getByText("0:11")).not.toHaveClass("animate-timer-critical");

    await advanceOneSecondAtATime(1);

    expect(screen.getByText("0:10")).toHaveClass("animate-timer-critical");
    expect(screen.getByText("0:10")).not.toHaveClass("animate-pulse");
  });

  it("calls onComplete once the timer reaches zero and stops going negative", async () => {
    const onComplete = vi.fn();

    render(
      <CountdownTimer
        startedAt={new Date("2026-01-01T00:00:00.000Z")}
        timeLimitInSeconds={2}
        onComplete={onComplete}
      />
    );

    await advanceOneSecondAtATime(2);
    expect(screen.getByText("0:00")).toBeVisible();

    await advanceOneSecondAtATime(5);

    expect(screen.getByText("0:00")).toBeVisible();
    expect(onComplete).toHaveBeenCalled();
  });
});
