import { describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import JsonUploadDialog from "./json-upload-dialog";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Upload JSON" }));
  return within(await screen.findByRole("dialog"));
}

describe("JsonUploadDialog", () => {
  const defaultProps = {
    triggerLabel: "Upload JSON",
    title: "Upload something",
    description: "Paste JSON here.",
    exampleJson: '{"foo":"bar"}',
  };

  it("shows an error toast for invalid JSON and does not call onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<JsonUploadDialog {...defaultProps} onSubmit={onSubmit} />);

    const dialog = await openDialog(user);
    await user.type(dialog.getByRole("textbox"), "not valid json");
    await user.click(dialog.getByRole("button", { name: "Upload" }));

    expect(toast.error).toHaveBeenCalledWith("That's not valid JSON.");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("parses valid JSON and calls onSubmit with it", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<JsonUploadDialog {...defaultProps} onSubmit={onSubmit} />);

    const dialog = await openDialog(user);
    fireEvent.change(dialog.getByRole("textbox"), {
      target: { value: '{"foo":"bar"}' },
    });
    await user.click(dialog.getByRole("button", { name: "Upload" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ foo: "bar" }));
    expect(toast.success).toHaveBeenCalledWith("Uploaded successfully");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the onSubmit error message and keeps the dialog open on failure", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Setup 2: boom"));
    render(<JsonUploadDialog {...defaultProps} onSubmit={onSubmit} />);

    const dialog = await openDialog(user);
    fireEvent.change(dialog.getByRole("textbox"), {
      target: { value: '{"foo":"bar"}' },
    });
    await user.click(dialog.getByRole("button", { name: "Upload" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Setup 2: boom")
    );
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("reads an uploaded file into the textarea", async () => {
    const user = userEvent.setup();
    render(<JsonUploadDialog {...defaultProps} onSubmit={vi.fn()} />);

    const dialog = await openDialog(user);
    const file = new File(['{"from":"file"}'], "upload.json", {
      type: "application/json",
    });
    await user.upload(dialog.getByLabelText("Upload JSON file"), file);

    expect(
      await dialog.findByDisplayValue('{"from":"file"}')
    ).toBeInTheDocument();
  });

  it("copies the example JSON to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...window.navigator,
      clipboard: { writeText },
    });
    render(<JsonUploadDialog {...defaultProps} onSubmit={vi.fn()} />);

    const dialog = await openDialog(user);
    await user.click(
      dialog.getByRole("button", { name: "Copy example schema" })
    );

    expect(writeText).toHaveBeenCalledWith('{"foo":"bar"}');
    expect(toast.success).toHaveBeenCalledWith("Copied example schema");
  });

  it("disables the upload button until there is text", async () => {
    const user = userEvent.setup();
    render(<JsonUploadDialog {...defaultProps} onSubmit={vi.fn()} />);

    const dialog = await openDialog(user);

    expect(dialog.getByRole("button", { name: "Upload" })).toBeDisabled();
  });
});
