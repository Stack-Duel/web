import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DuelDemoSection from "./duel-demo-section";

const DUEL_DEMO_ALT =
  "A live Algowars duel: two players racing to solve the same coding problem, judged instantly";

describe("DuelDemoSection", () => {
  it("shows the duel demo video by default", () => {
    const { container } = render(<DuelDemoSection />);

    const video = container.querySelector("video");
    expect(video).toBeVisible();
    expect(video).toHaveAttribute("aria-label", DUEL_DEMO_ALT);
    expect(video).toHaveAttribute("poster", "/Demos/duel-demo.png");
    expect(container.querySelector("source")).toHaveAttribute(
      "src",
      "/Demos/duel-demo-video.mp4"
    );
  });

  it("falls back to the duel demo image if the video is disabled", () => {
    const { container } = render(<DuelDemoSection />);

    const video = container.querySelector("video");
    if (video) fireEvent.error(video);

    expect(screen.getByRole("img", { name: DUEL_DEMO_ALT })).toBeVisible();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });
});
