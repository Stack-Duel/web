import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useKeyboardCommand } from "./use-keyboard-command";

function dispatchKeyDown(init: KeyboardEventInit) {
  const event = new KeyboardEvent("keydown", { cancelable: true, ...init });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe("useKeyboardCommand", () => {
  it("calls onCommand and prevents the default action when the key matches", () => {
    const onCommand = vi.fn();
    renderHook(() => useKeyboardCommand({ key: "k", onCommand }));

    const event = dispatchKeyDown({ key: "k" });

    expect(onCommand).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not call onCommand for a different key", () => {
    const onCommand = vi.fn();
    renderHook(() => useKeyboardCommand({ key: "k", onCommand }));

    dispatchKeyDown({ key: "j" });

    expect(onCommand).not.toHaveBeenCalled();
  });

  it("does not call onCommand when disabled", () => {
    const onCommand = vi.fn();
    renderHook(() =>
      useKeyboardCommand({ key: "k", onCommand, enabled: false })
    );

    dispatchKeyDown({ key: "k" });

    expect(onCommand).not.toHaveBeenCalled();
  });

  it("does not call onCommand when altKey is held", () => {
    const onCommand = vi.fn();
    renderHook(() => useKeyboardCommand({ key: "k", onCommand }));

    dispatchKeyDown({ key: "k", altKey: true });

    expect(onCommand).not.toHaveBeenCalled();
  });

  it("requires ctrlKey without metaKey for the ctrl modifier", () => {
    const onCommand = vi.fn();
    renderHook(() =>
      useKeyboardCommand({ key: "k", onCommand, modifier: "ctrl" })
    );

    dispatchKeyDown({ key: "k" });
    expect(onCommand).not.toHaveBeenCalled();

    dispatchKeyDown({ key: "k", ctrlKey: true, metaKey: true });
    expect(onCommand).not.toHaveBeenCalled();

    dispatchKeyDown({ key: "k", ctrlKey: true });
    expect(onCommand).toHaveBeenCalledOnce();
  });

  it("accepts either ctrlKey or metaKey for the primary modifier", () => {
    const onCommand = vi.fn();
    renderHook(() =>
      useKeyboardCommand({ key: "k", onCommand, modifier: "primary" })
    );

    dispatchKeyDown({ key: "k" });
    expect(onCommand).not.toHaveBeenCalled();

    dispatchKeyDown({ key: "k", metaKey: true });
    dispatchKeyDown({ key: "k", ctrlKey: true });

    expect(onCommand).toHaveBeenCalledTimes(2);
  });

  it("stops listening after unmount", () => {
    const onCommand = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardCommand({ key: "k", onCommand })
    );

    unmount();
    dispatchKeyDown({ key: "k" });

    expect(onCommand).not.toHaveBeenCalled();
  });
});
