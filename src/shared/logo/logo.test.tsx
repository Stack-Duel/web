import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Logo from "./logo";
import { tenants } from "@/domains/tenant/config/tenant-config";

describe("Logo", () => {
  it("renders the tenant's light and dark logos", () => {
    render(<Logo />);

    const images = screen.getAllByAltText(tenants.algowars.name);
    expect(images).toHaveLength(2);
  });
});
