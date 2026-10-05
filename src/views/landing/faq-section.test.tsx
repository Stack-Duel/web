import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FaqSection from "./faq-section";

describe("FaqSection", () => {
  it("renders every FAQ question as a collapsed accordion trigger", () => {
    render(<FaqSection />);

    const questions = [
      "Is Algowars free to use?",
      "What programming languages are supported?",
      "How are matches judged?",
      "What game modes are available?",
      "Algowars is in alpha, what does that mean?",
    ];

    for (const question of questions) {
      const trigger = screen.getByRole("button", { name: question });
      expect(trigger).toBeVisible();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("reveals an answer when its question is clicked", async () => {
    const user = userEvent.setup();
    render(<FaqSection />);

    expect(
      screen.queryByText(/We currently support 3 languages/)
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "What programming languages are supported?",
      })
    );

    expect(screen.getByText(/We currently support 3 languages/)).toBeVisible();
  });

  it("only keeps one answer open at a time", async () => {
    const user = userEvent.setup();
    render(<FaqSection />);

    await user.click(
      screen.getByRole("button", { name: "Is Algowars free to use?" })
    );
    expect(
      screen.getByRole("button", { name: "Is Algowars free to use?" })
    ).toHaveAttribute("aria-expanded", "true");

    await user.click(
      screen.getByRole("button", { name: "How are matches judged?" })
    );

    expect(
      screen.getByRole("button", { name: "How are matches judged?" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Is Algowars free to use?" })
    ).toHaveAttribute("aria-expanded", "false");
  });
});
