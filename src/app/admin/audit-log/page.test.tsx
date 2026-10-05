import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminAuditLogPage from "./page";

vi.mock("@/views/admin/admin-audit-log-layout", () => ({
  default: () => <div>Admin Audit Log Layout</div>,
}));

describe("AdminAuditLogPage", () => {
  it("renders the admin audit log layout", () => {
    render(<AdminAuditLogPage />);

    expect(screen.getByText("Admin Audit Log Layout")).toBeVisible();
  });
});
