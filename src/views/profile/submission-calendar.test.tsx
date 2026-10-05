import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubmissionCalendar from "./submission-calendar";

describe("SubmissionCalendar", () => {
  it("shows an empty-state message when there is no history", () => {
    render(
      <SubmissionCalendar
        days={[]}
        rangeStart="2026-01-01"
        rangeEnd="2026-01-03"
      />
    );

    expect(screen.getByText("No submission activity yet.")).toBeVisible();
  });

  it("shows the total submission count for the period", () => {
    render(
      <SubmissionCalendar
        days={[
          { date: "2026-01-01", count: 2 },
          { date: "2026-01-02", count: 3 },
        ]}
        rangeStart="2026-01-01"
        rangeEnd="2026-01-03"
      />
    );

    expect(
      screen.getByText(/5 submissions in the last 12 months/)
    ).toBeVisible();
  });

  it("shows the current streak based on trailing days with submissions", () => {
    render(
      <SubmissionCalendar
        days={[
          { date: "2026-01-01", count: 1 },
          { date: "2026-01-03", count: 2 },
          { date: "2026-01-04", count: 1 },
        ]}
        rangeStart="2026-01-01"
        rangeEnd="2026-01-04"
      />
    );

    expect(screen.getByText("2 days streak")).toBeVisible();
  });

  it("does not break the current streak when today has no submissions yet", () => {
    render(
      <SubmissionCalendar
        days={[
          { date: "2026-01-01", count: 1 },
          { date: "2026-01-02", count: 1 },
        ]}
        rangeStart="2026-01-01"
        rangeEnd="2026-01-03"
      />
    );

    expect(screen.getByText("2 days streak")).toBeVisible();
  });

  it("shows the longest streak across the period", () => {
    render(
      <SubmissionCalendar
        days={[
          { date: "2026-01-01", count: 1 },
          { date: "2026-01-02", count: 1 },
          { date: "2026-01-03", count: 1 },
          { date: "2026-01-05", count: 1 },
        ]}
        rangeStart="2026-01-01"
        rangeEnd="2026-01-05"
      />
    );

    expect(screen.getByText(/longest streak 3 days/)).toBeVisible();
  });

  it("shows a tooltip with the day's submission count on hover", async () => {
    const user = userEvent.setup();
    render(
      <SubmissionCalendar
        days={[{ date: "2026-01-01", count: 4 }]}
        rangeStart="2026-01-01"
        rangeEnd="2026-01-01"
      />
    );

    await user.hover(screen.getByLabelText("4 submissions on Jan 1, 2026"));

    expect(
      await screen.findByText("4 submissions on Jan 1, 2026")
    ).toBeVisible();
  });

  it("uses singular wording for a single submission", () => {
    render(
      <SubmissionCalendar
        days={[{ date: "2026-01-01", count: 1 }]}
        rangeStart="2026-01-01"
        rangeEnd="2026-01-01"
      />
    );

    expect(
      screen.getByLabelText("1 submission on Jan 1, 2026")
    ).toBeInTheDocument();
  });

  it("hides a month label that would overlap the next one", () => {
    render(
      <SubmissionCalendar
        days={[
          { date: "2026-01-31", count: 1 },
          { date: "2026-02-01", count: 1 },
          { date: "2026-02-02", count: 1 },
          { date: "2026-02-03", count: 1 },
          { date: "2026-02-04", count: 1 },
          { date: "2026-02-05", count: 1 },
          { date: "2026-02-06", count: 1 },
          { date: "2026-02-07", count: 1 },
        ]}
        rangeStart="2026-01-31"
        rangeEnd="2026-02-07"
      />
    );

    expect(screen.queryByText("Jan")).not.toBeInTheDocument();
    expect(screen.getByText("Feb")).toBeVisible();
  });
});
