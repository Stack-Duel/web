import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { StatTile } from "./stat-tile";

describe("StatTile", () => {
  it("shows the label and formatted value", () => {
    render(<StatTile label="Users" value={1234} icon={Users} />);

    expect(screen.getByText("Users")).toBeVisible();
    expect(screen.getByText("1,234")).toBeVisible();
  });

  it("shows a loading skeleton instead of the value while undefined", () => {
    render(<StatTile label="Users" value={undefined} icon={Users} />);

    expect(screen.getByText("Users")).toBeVisible();
    expect(screen.queryByText(/^\d/)).not.toBeInTheDocument();
  });

  it("shows zero as a value, not a loading state", () => {
    render(<StatTile label="Users" value={0} icon={Users} />);

    expect(screen.getByText("0")).toBeVisible();
  });

  it("links to the given href when provided", () => {
    render(
      <StatTile label="Users" value={5} icon={Users} href="/admin/users" />
    );

    expect(screen.getByRole("link", { name: "View Users" })).toHaveAttribute(
      "href",
      "/admin/users"
    );
  });

  it("does not render a link when no href is given", () => {
    render(<StatTile label="Users" value={5} icon={Users} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
