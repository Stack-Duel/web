import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PublicTestCase } from "@/domains/problem/models/problem";
import ReactPreview from "./react-preview";

const CODEPREVIEW_ORIGIN = "https://codepreview.example.com";

function sendReadyMessage(
  iframe: HTMLIFrameElement,
  overrides: Partial<{ origin: string; source: Window | null }> = {}
) {
  window.dispatchEvent(
    new MessageEvent("message", {
      data: { type: "algowars-preview-ready" },
      origin: overrides.origin ?? CODEPREVIEW_ORIGIN,
      source: "source" in overrides ? overrides.source : iframe.contentWindow,
    })
  );
}

function getIframe() {
  return screen.getByTitle("React component preview") as HTMLIFrameElement;
}

describe("ReactPreview", () => {
  it("points the iframe at the codepreview origin with a cross-origin sandbox", () => {
    render(<ReactPreview code="" functionName={null} />);

    const iframe = getIframe();
    expect(iframe.src).toBe(`${CODEPREVIEW_ORIGIN}/preview-frame.html`);
    expect(iframe.getAttribute("sandbox")).toBe(
      "allow-scripts allow-same-origin"
    );
  });

  it("does not render a test case selector when no test cases have props", () => {
    render(<ReactPreview code="" functionName={null} testCases={[]} />);

    expect(screen.queryByText("Test case:")).not.toBeInTheDocument();
  });

  it("posts code to the iframe only after it reports ready", async () => {
    const postMessage = vi.fn();
    render(<ReactPreview code="const x = 1;" functionName="Solution" />);

    const iframe = getIframe();
    vi.spyOn(iframe.contentWindow!, "postMessage").mockImplementation(
      postMessage
    );

    expect(postMessage).not.toHaveBeenCalled();

    sendReadyMessage(iframe);

    await waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "algowars-preview-code",
          code: "const x = 1;",
          functionName: "Solution",
        }),
        CODEPREVIEW_ORIGIN
      )
    );
  });

  it("ignores a ready message from the wrong origin", async () => {
    const postMessage = vi.fn();
    render(<ReactPreview code="code" functionName="Solution" />);

    const iframe = getIframe();
    vi.spyOn(iframe.contentWindow!, "postMessage").mockImplementation(
      postMessage
    );

    sendReadyMessage(iframe, { origin: "https://evil.example.com" });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("ignores a message that isn't from the tracked iframe", async () => {
    const postMessage = vi.fn();
    render(<ReactPreview code="code" functionName="Solution" />);

    const iframe = getIframe();
    vi.spyOn(iframe.contentWindow!, "postMessage").mockImplementation(
      postMessage
    );

    sendReadyMessage(iframe, { source: null });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("does not post when there is no functionName yet", async () => {
    const postMessage = vi.fn();
    render(<ReactPreview code="code" functionName={null} />);

    const iframe = getIframe();
    vi.spyOn(iframe.contentWindow!, "postMessage").mockImplementation(
      postMessage
    );

    sendReadyMessage(iframe);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("offers only test cases with a props input, and sends the selected one's parsed props", async () => {
    const postMessage = vi.fn();
    const testCases: PublicTestCase[] = [
      {
        name: "with props",
        inputs: [{ value: '{"count":1}', valueType: "props" }],
        expectedOutputs: [],
      },
      {
        name: "without props",
        inputs: [{ value: "5", valueType: "number" }],
        expectedOutputs: [],
      },
      {
        name: "invalid json props",
        inputs: [{ value: "not json", valueType: "props" }],
        expectedOutputs: [],
      },
    ];

    render(
      <ReactPreview code="code" functionName="Solution" testCases={testCases} />
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("with props");

    const iframe = getIframe();
    vi.spyOn(iframe.contentWindow!, "postMessage").mockImplementation(
      postMessage
    );

    sendReadyMessage(iframe);

    await waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ props: { count: 1 } }),
        CODEPREVIEW_ORIGIN
      )
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox"));

    expect(
      screen.getByRole("option", { name: "with props" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "invalid json props" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "without props" })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("option", { name: "invalid json props" })
    );

    await waitFor(() =>
      expect(postMessage).toHaveBeenLastCalledWith(
        expect.objectContaining({ props: {} }),
        CODEPREVIEW_ORIGIN
      )
    );
  });
});
