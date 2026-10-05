"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import type { DailyUserCount } from "../models/admin-dashboard-stats";

const chartConfig = {
  count: {
    label: "New users",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type NewUsersChartProps = {
  data: DailyUserCount[];
};

export function NewUsersChart({ data }: Readonly<NewUsersChartProps>) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <AreaChart data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={formatDate}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                new Date(String(value)).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
            />
          }
        />
        <Area
          dataKey="count"
          type="monotone"
          fill="var(--color-count)"
          fillOpacity={0.2}
          stroke="var(--color-count)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
