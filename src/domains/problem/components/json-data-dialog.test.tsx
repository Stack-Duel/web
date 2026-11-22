import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JsonDataDialog from "./json-data-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderDialog(
  current: unknown,
  onApply: (parsed: unknown) => void = vi.fn()
) {
  render(
    <JsonDataDialog
      title="Details JSON"
      description="Edit as JSON."
      getCurrentJson={() => current}
      onApply={onApply}
    />
  );

  return onApply;
}

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "JSON" }));
  return screen.getByLabelText("Details JSON content");
}

beforeEach(() => vi.clearAllMocks());

describe("JsonDataDialog", () => {
  it("opens prefilled with the current data", async () => {
    const user = userEvent.setup();
    renderDialog({ title: "Two Sum", tags: ["arrays"] });

    const textarea = await open(user);

    expect(textarea).toHaveValue(
      JSON.stringify({ title: "Two Sum", tags: ["arrays"] }, null, 2)
    );
  });

  it("applies edited JSON to the form", async () => {
    const user = userEvent.setup();
    const onApply = renderDialog({ title: "Two Sum" });

    const textarea = await open(user);
    await user.clear(textarea);
    await user.type(textarea, '{{"title":"Three Sum"}');
    await user.click(screen.getByRole("button", { name: "Apply to form" }));

    expect(onApply).toHaveBeenCalledWith({ title: "Three Sum" });
  });

  it("reports malformed JSON without closing", async () => {
    const user = userEvent.setup();
    const onApply = renderDialog({ title: "Two Sum" });

    const textarea = await open(user);
    await user.clear(textarea);
    await user.type(textarea, "not json");
    await user.click(screen.getByRole("button", { name: "Apply to form" }));

    expect(screen.getByText("That is not valid JSON.")).toBeVisible();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("surfaces a validation failure raised while applying", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn(() => {
      throw new Error("tags: Add at least 1 tag");
    });
    renderDialog({ title: "Two Sum" }, onApply);

    const textarea = await open(user);
    await user.clear(textarea);
    await user.type(textarea, '{{"title":"Three Sum"}');
    await user.click(screen.getByRole("button", { name: "Apply to form" }));

    expect(screen.getByText("tags: Add at least 1 tag")).toBeVisible();
  });

  it("reopens with the latest data rather than the last edit", async () => {
    const user = userEvent.setup();
    let current: unknown = { title: "Two Sum" };
    render(
      <JsonDataDialog
        title="Details JSON"
        description="Edit as JSON."
        getCurrentJson={() => current}
        onApply={vi.fn()}
      />
    );

    await open(user);
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    current = { title: "Changed Elsewhere" };
    const textarea = await open(user);

    expect(textarea).toHaveValue(
      JSON.stringify({ title: "Changed Elsewhere" }, null, 2)
    );
  });
});
