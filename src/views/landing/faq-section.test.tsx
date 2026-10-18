import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FaqSection from "./faq-section";
import { testTenant } from "@/test/mocks/tenant";

vi.mock(
  "@/domains/tenant/lib/get-current-tenant",
  () => import("@/test/mocks/tenant")
);

describe("FaqSection", () => {
  it("renders every FAQ question as a collapsed accordion trigger", async () => {
    render(await FaqSection());

    const questions = [
      `Is ${testTenant.name} free to use?`,
      "What programming languages are supported?",
      "How are matches judged?",
      "What game modes are available?",
      `${testTenant.name} is in alpha, what does that mean?`,
    ];

    for (const question of questions) {
      const trigger = screen.getByRole("button", { name: question });
      expect(trigger).toBeVisible();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("reveals an answer when its question is clicked", async () => {
    const user = userEvent.setup();
    render(await FaqSection());

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
    render(await FaqSection());

    const freeToUseQuestion = `Is ${testTenant.name} free to use?`;

    await user.click(screen.getByRole("button", { name: freeToUseQuestion }));
    expect(
      screen.getByRole("button", { name: freeToUseQuestion })
    ).toHaveAttribute("aria-expanded", "true");

    await user.click(
      screen.getByRole("button", { name: "How are matches judged?" })
    );

    expect(
      screen.getByRole("button", { name: "How are matches judged?" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: freeToUseQuestion })
    ).toHaveAttribute("aria-expanded", "false");
  });
});
