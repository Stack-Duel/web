import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminProblemTagInput from "./admin-problem-tag-input";

describe("AdminProblemTagInput", () => {
  it("renders the given tags as badges", () => {
    render(
      <AdminProblemTagInput tags={["arrays", "hash-map"]} onChange={vi.fn()} />
    );

    expect(screen.getByText("arrays")).toBeVisible();
    expect(screen.getByText("hash-map")).toBeVisible();
  });

  it("adds a normalized tag when Enter is pressed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AdminProblemTagInput tags={[]} onChange={onChange} />);

    await user.type(
      screen.getByPlaceholderText("Add a tag and press Enter..."),
      "Two Sum!{Enter}"
    );

    expect(onChange).toHaveBeenCalledWith(["two-sum"]);
  });

  it("adds a tag when a comma is typed", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AdminProblemTagInput tags={[]} onChange={onChange} />);

    await user.type(
      screen.getByPlaceholderText("Add a tag and press Enter..."),
      "dynamic programming,"
    );

    expect(onChange).toHaveBeenCalledWith(["dynamic-programming"]);
  });

  it("does not add a duplicate tag", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AdminProblemTagInput tags={["arrays"]} onChange={onChange} />);

    await user.type(
      screen.getByPlaceholderText("Add a tag and press Enter..."),
      "arrays{Enter}"
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it("adds the draft tag on blur", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <div>
        <AdminProblemTagInput tags={[]} onChange={onChange} />
        <button>elsewhere</button>
      </div>
    );

    await user.type(
      screen.getByPlaceholderText("Add a tag and press Enter..."),
      "graphs"
    );
    await user.click(screen.getByRole("button", { name: "elsewhere" }));

    expect(onChange).toHaveBeenCalledWith(["graphs"]);
  });

  it("removes a tag when its remove button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminProblemTagInput tags={["arrays", "graphs"]} onChange={onChange} />
    );

    await user.click(screen.getByRole("button", { name: "Remove arrays" }));

    expect(onChange).toHaveBeenCalledWith(["graphs"]);
  });

  it("removes the last tag on Backspace when the draft is empty", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminProblemTagInput tags={["arrays", "graphs"]} onChange={onChange} />
    );

    const input = screen.getByPlaceholderText("Add a tag and press Enter...");
    input.focus();
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenCalledWith(["arrays"]);
  });

  it("does not remove a tag on Backspace when the draft has text", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AdminProblemTagInput tags={["arrays"]} onChange={onChange} />);

    await user.type(
      screen.getByPlaceholderText("Add a tag and press Enter..."),
      "a{Backspace}"
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});
