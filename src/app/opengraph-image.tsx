import { ImageResponse } from "next/og";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";
import {
  tenants,
  defaultTenantId,
} from "@/domains/tenant/config/tenant-config";

export const alt = `${tenants[defaultTenantId].name}: Competitive Coding Platform`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const tenant = await getCurrentTenant();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "sans-serif",
        padding: "80px",
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", gap: 14 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: "#38bdf8",
          }}
        />
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: "#a3e635",
          }}
        />
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: "#e879f9",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 104,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        {tenant.name.toUpperCase()}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 34,
          color: "#a1a1aa",
          maxWidth: 900,
        }}
      >
        {tenant.tagline}
      </div>
    </div>,
    { ...size }
  );
}
