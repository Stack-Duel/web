"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useGameModes } from "@/domains/game/api/use-game-modes";
import { GameModeKey } from "@/domains/game/models/game-mode";
import { useRatingHistory } from "../api/get-rating-history";

const chartConfig = {
  rating: {
    label: "Rating",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function formatSeason(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

export default function RatingHistoryChart() {
  const { data: gameModes } = useGameModes();
  const [selectedKey, setSelectedKey] = useState<GameModeKey>();

  const modes = gameModes ?? [];
  const hasModes = modes.length > 0;
  const activeKey = selectedKey ?? modes[0]?.key ?? GameModeKey.SoloRush;

  const { data: history, isLoading } = useRatingHistory({
    gameModeKey: activeKey,
    queryConfig: { enabled: hasModes },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4" />
          Rating history
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasModes ? (
          <Tabs
            value={activeKey}
            onValueChange={(value) => setSelectedKey(value as GameModeKey)}
          >
            <TabsList>
              {modes.map((mode) => (
                <TabsTrigger key={mode.id} value={mode.key}>
                  {mode.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={activeKey}>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : !history || history.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No rated games played yet.
                </p>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-64 w-full"
                >
                  <LineChart data={history} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="seasonPeriodStart"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={formatSeason}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={40}
                      domain={["dataMin - 50", "dataMax + 50"]}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            formatSeason(String(value))
                          }
                        />
                      }
                    />
                    <Line
                      dataKey="rating"
                      type="monotone"
                      stroke="var(--color-rating)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "var(--color-rating)" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Skeleton className="h-64 w-full" />
        )}
      </CardContent>
    </Card>
  );
}
