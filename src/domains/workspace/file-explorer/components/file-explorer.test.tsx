import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileExplorer from "./file-explorer";
import { MAIN_FILE_KEY } from "@/domains/workspace/state/workspace-store";

const files = [
  { path: "RecordItem.jsx", content: "" },
  { path: "Helper.js", content: "" },
];

describe("FileExplorer", () => {
  it("lists the main file and every additional file", () => {
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={vi.fn()}
        onDeleteFile={vi.fn()}
        onRenameFile={vi.fn()}
      />
    );

    expect(screen.getByText("Solution.jsx")).toBeInTheDocument();
    expect(screen.getByText("RecordItem.jsx")).toBeInTheDocument();
    expect(screen.getByText("Helper.js")).toBeInTheDocument();
  });

  it("calls onSelectFile with the main-file sentinel and each file's path", async () => {
    const user = userEvent.setup();
    const onSelectFile = vi.fn();
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={onSelectFile}
        onAddFile={vi.fn()}
        onDeleteFile={vi.fn()}
        onRenameFile={vi.fn()}
      />
    );

    await user.click(screen.getByText("RecordItem.jsx"));
    expect(onSelectFile).toHaveBeenCalledWith("RecordItem.jsx");

    await user.click(screen.getByText("Helper.js"));
    expect(onSelectFile).toHaveBeenCalledWith("Helper.js");

    await user.click(screen.getByText("Solution.jsx"));
    expect(onSelectFile).toHaveBeenCalledWith(MAIN_FILE_KEY);
  });

  it.each([
    [
      "adds a .jsx extension when the typed name has none",
      "Utils{Enter}",
      "Utils.jsx",
    ],
    ["keeps an explicit extension as-is", "styles.ts{Enter}", "styles.ts"],
    [
      "de-duplicates a name that collides with an existing file, regardless of extension",
      "RecordItem{Enter}",
      "RecordItem2.jsx",
    ],
  ])("%s", async (_description, typed, expected) => {
    const user = userEvent.setup();
    const onAddFile = vi.fn();
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={onAddFile}
        onDeleteFile={vi.fn()}
        onRenameFile={vi.fn()}
      />
    );

    await user.click(screen.getByTitle("New file"));
    await user.type(screen.getByPlaceholderText("NewFile.jsx"), typed);

    expect(onAddFile).toHaveBeenCalledWith(expected);
  });

  it("de-duplicates against the reserved main file name", async () => {
    const user = userEvent.setup();
    const onAddFile = vi.fn();
    render(
      <FileExplorer
        files={[]}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={onAddFile}
        onDeleteFile={vi.fn()}
        onRenameFile={vi.fn()}
      />
    );

    await user.click(screen.getByTitle("New file"));
    await user.type(
      screen.getByPlaceholderText("NewFile.jsx"),
      "solution{Enter}"
    );

    expect(onAddFile).toHaveBeenCalledWith("solution2.jsx");
  });

  it("discards the add-file input on Escape without calling onAddFile", async () => {
    const user = userEvent.setup();
    const onAddFile = vi.fn();
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={onAddFile}
        onDeleteFile={vi.fn()}
        onRenameFile={vi.fn()}
      />
    );

    await user.click(screen.getByTitle("New file"));
    await user.type(screen.getByPlaceholderText("NewFile.jsx"), "Abandoned");
    await user.keyboard("{Escape}");

    expect(onAddFile).not.toHaveBeenCalled();
    expect(
      screen.queryByPlaceholderText("NewFile.jsx")
    ).not.toBeInTheDocument();
  });

  it("does not call onAddFile when the name is left blank", async () => {
    const user = userEvent.setup();
    const onAddFile = vi.fn();
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={onAddFile}
        onDeleteFile={vi.fn()}
        onRenameFile={vi.fn()}
      />
    );

    await user.click(screen.getByTitle("New file"));
    await user.keyboard("{Enter}");

    expect(onAddFile).not.toHaveBeenCalled();
  });

  it("does not offer a delete or rename option for the main file", () => {
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={vi.fn()}
        onDeleteFile={vi.fn()}
        onRenameFile={vi.fn()}
      />
    );

    fireEvent.contextMenu(screen.getByText("Solution.jsx"));

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Rename")).not.toBeInTheDocument();
  });

  it("renames an additional file after typing a new name", async () => {
    const user = userEvent.setup();
    const onRenameFile = vi.fn();
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={vi.fn()}
        onDeleteFile={vi.fn()}
        onRenameFile={onRenameFile}
      />
    );

    fireEvent.contextMenu(screen.getByText("RecordItem.jsx"));
    await user.click(await screen.findByText("Rename"));
    const input = screen.getByDisplayValue("RecordItem.jsx");
    await user.clear(input);
    await user.type(input, "Renamed{Enter}");

    expect(onRenameFile).toHaveBeenCalledWith("RecordItem.jsx", "Renamed.jsx");
  });

  it("discards a rename on Escape without calling onRenameFile", async () => {
    const user = userEvent.setup();
    const onRenameFile = vi.fn();
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={vi.fn()}
        onDeleteFile={vi.fn()}
        onRenameFile={onRenameFile}
      />
    );

    fireEvent.contextMenu(screen.getByText("RecordItem.jsx"));
    await user.click(await screen.findByText("Rename"));
    const input = screen.getByDisplayValue("RecordItem.jsx");
    await user.type(input, "Abandoned");
    await user.keyboard("{Escape}");

    expect(onRenameFile).not.toHaveBeenCalled();
    expect(screen.getByText("RecordItem.jsx")).toBeInTheDocument();
  });

  it("does not rename when the new name is unchanged", async () => {
    const user = userEvent.setup();
    const onRenameFile = vi.fn();
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={vi.fn()}
        onDeleteFile={vi.fn()}
        onRenameFile={onRenameFile}
      />
    );

    fireEvent.contextMenu(screen.getByText("RecordItem.jsx"));
    await user.click(await screen.findByText("Rename"));
    expect(screen.getByDisplayValue("RecordItem.jsx")).toBeVisible();
    await user.keyboard("{Enter}");

    expect(onRenameFile).not.toHaveBeenCalled();
  });

  it("deletes an additional file after confirming in the dialog", async () => {
    const user = userEvent.setup();
    const onDeleteFile = vi.fn();
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={vi.fn()}
        onDeleteFile={onDeleteFile}
        onRenameFile={vi.fn()}
      />
    );

    fireEvent.contextMenu(screen.getByText("RecordItem.jsx"));
    await user.click(await screen.findByText("Delete"));
    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(onDeleteFile).toHaveBeenCalledWith("RecordItem.jsx");
  });

  it("does not delete the file when the confirmation is canceled", async () => {
    const user = userEvent.setup();
    const onDeleteFile = vi.fn();
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={vi.fn()}
        onDeleteFile={onDeleteFile}
        onRenameFile={vi.fn()}
      />
    );

    fireEvent.contextMenu(screen.getByText("Helper.js"));
    await user.click(await screen.findByText("Delete"));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(onDeleteFile).not.toHaveBeenCalled();
  });

  it("collapses the file list and can be expanded again", async () => {
    const user = userEvent.setup();
    render(
      <FileExplorer
        files={files}
        activeKey={MAIN_FILE_KEY}
        onSelectFile={vi.fn()}
        onAddFile={vi.fn()}
        onDeleteFile={vi.fn()}
        onRenameFile={vi.fn()}
      />
    );

    await user.click(screen.getByText("FILES"));
    expect(screen.queryByText("Solution.jsx")).not.toBeInTheDocument();

    await user.click(screen.getByTitle("Show files"));
    expect(screen.getByText("Solution.jsx")).toBeInTheDocument();
  });
});
