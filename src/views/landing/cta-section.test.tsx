import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CtaSection from "./cta-section";
import { routerConfig } from "@/shared/router-config";

describe("CtaSection", () => {
  it("links Get Started Free to the sign up route", () => {
    render(<CtaSection />);

    expect(
      screen.getByRole("link", { name: "Get Started Free" })
    ).toHaveAttribute("href", routerConfig.authSignUp.path);
  });

  it("links Browse Problems to the problems route", () => {
    render(<CtaSection />);

    expect(
      screen.getByRole("link", { name: "Browse Problems" })
    ).toHaveAttribute("href", routerConfig.problems.path);
  });
});
