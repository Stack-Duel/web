import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminSubmissionAttemptPayload from "./admin-submission-attempt-payload";

describe("AdminSubmissionAttemptPayload", () => {
  it("renders nothing when value is null", () => {
    const { container } = render(
      <AdminSubmissionAttemptPayload title="Request Payload" value={null} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("pretty-prints valid JSON", () => {
    render(
      <AdminSubmissionAttemptPayload
        title="Request Payload"
        value={JSON.stringify({ a: 1 })}
      />
    );

    expect(screen.getByText(/"a": 1/)).toBeVisible();
  });

  it("falls back to the raw string for invalid JSON", () => {
    render(
      <AdminSubmissionAttemptPayload title="Request Payload" value="not json" />
    );

    expect(screen.getByText("not json")).toBeVisible();
  });

  it("starts expanded for a short payload", () => {
    render(
      <AdminSubmissionAttemptPayload title="Request Payload" value="short" />
    );

    expect(screen.getByText("short")).toBeVisible();
  });

  it("starts collapsed for a long payload and expands on click", async () => {
    const user = userEvent.setup();
    const longValue = "x".repeat(600);
    render(
      <AdminSubmissionAttemptPayload
        title="Request Payload"
        value={longValue}
      />
    );

    expect(screen.queryByText(longValue)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Request Payload/ }));

    expect(screen.getByText(longValue)).toBeVisible();
  });
});
