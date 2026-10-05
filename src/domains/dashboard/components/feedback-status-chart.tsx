"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import type { FeedbackStatus } from "@/domains/feedback/models/feedback";
import type { FeedbackStatusCount } from "../models/admin-dashboard-stats";

const chartConfig = {
  New: { label: "New", color: "var(--chart-1)" },
  Triaged: { label: "Triaged", color: "var(--chart-2)" },
  InProgress: { label: "In progress", color: "var(--chart-3)" },
  Resolved: { label: "Resolved", color: "var(--chart-4)" },
  WontFix: { label: "Won't fix", color: "var(--chart-5)" },
} satisfies ChartConfig;

const STATUS_ORDER: FeedbackStatus[] = [
  "New",
  "Triaged",
  "InProgress",
  "Resolved",
  "WontFix",
];

type FeedbackStatusChartProps = {
  data: FeedbackStatusCount[];
};

export function FeedbackStatusChart({
  data,
}: Readonly<FeedbackStatusChartProps>) {
  const countsByStatus = new Map(data.map((item) => [item.status, item.count]));
  const chartData = STATUS_ORDER.map((status) => ({
    status,
    label: chartConfig[status].label,
    count: countsByStatus.get(status) ?? 0,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={4}>
          {chartData.map((item) => (
            <Cell
              key={item.status}
              fill={`var(--color-${item.status})`}
              stroke="var(--border)"
              strokeWidth={1}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
