"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DashboardMetrics } from "@/types";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS_LIGHT = ["#0f4c81", "#2d6fa3", "#4d8cc0", "#7eaed2", "#9ebfde"];
const PIE_COLORS_DARK = ["#60a5fa", "#38bdf8", "#22d3ee", "#34d399", "#a3e635"];
const CATEGORY_TICK_LABELS: Record<string, string> = {
  "Iluminação pública": "Iluminação",
  "Lixo urbano": "Lixo",
};

export function MetricsCharts({
  metrics,
  compact = false,
}: {
  metrics: DashboardMetrics;
  compact?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const chartGridColor = isDark ? "hsl(217 32% 24%)" : "hsl(214 28% 88%)";
  const chartTextColor = isDark ? "hsl(210 40% 96%)" : "hsl(216 58% 24%)";
  const chartTooltipStyle = {
    backgroundColor: isDark ? "hsl(218 45% 12%)" : "hsl(0 0% 100%)",
    borderColor: isDark ? "hsl(217 32% 24%)" : "hsl(214 28% 88%)",
    color: isDark ? "hsl(210 40% 96%)" : "hsl(216 58% 14%)",
    borderRadius: "8px",
    fontSize: "12px",
  };
  const lineOpenColor = isDark ? "#60a5fa" : "#0f4c81";
  const lineResolvedColor = isDark ? "#4ade80" : "#35a46b";
  const categoryBarColor = isDark ? "#60a5fa" : "#5b8fb0";
  const pieColors = isDark ? PIE_COLORS_DARK : PIE_COLORS_LIGHT;

  const categoryData = Object.entries(metrics.byCategory)
    .map(([key, value]) => ({
      category: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] ?? key,
      total: value,
    }))
    .sort((left, right) => right.total - left.total);

  const statusData = Object.entries(metrics.byStatus).map(([key, value]) => ({
    status: STATUS_LABELS[key as keyof typeof STATUS_LABELS] ?? key,
    total: value,
  }));
  const statusTotal = statusData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div
      className={cn(
        "grid gap-4 lg:grid-cols-3",
        compact && "h-full min-h-0 gap-3 lg:grid-cols-[1.7fr_1fr]",
      )}
    >
      <Card className={cn("lg:col-span-2", compact && "flex min-h-0 flex-col lg:col-span-1")}>
        <CardHeader className={cn(compact && "shrink-0 p-4 pb-2")}>
          <CardTitle className={cn(compact && "text-sm")}>Status atual</CardTitle>
        </CardHeader>
        <CardContent
          className={cn(
            "h-72 sm:h-80",
            compact &&
              "flex h-[260px] flex-col gap-2 sm:h-[290px] lg:h-auto lg:min-h-0 lg:flex-1",
          )}
        >
          <div className={cn(compact ? "min-h-0 flex-1" : "h-full")}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="total"
                  nameKey="status"
                  innerRadius={56}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`${entry.status}-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
            {statusData.map((entry, index) => {
              const color = pieColors[index % pieColors.length];
              const percentage =
                statusTotal > 0 ? Math.round((entry.total / statusTotal) * 100) : 0;
              return (
                <div key={entry.status} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-muted-foreground">
                    {entry.status} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className={cn(compact ? "grid min-h-0 gap-3 lg:grid-rows-2" : "lg:col-span-1")}>
        <Card className={cn(compact && "flex min-h-0 flex-col")}>
          <CardHeader className={cn(compact && "shrink-0 p-4 pb-2")}>
            <CardTitle className={cn(compact && "text-sm")}>Comparativo mensal</CardTitle>
          </CardHeader>
          <CardContent
            className={cn(
              "h-72 sm:h-80",
              compact && "h-[230px] sm:h-[250px] lg:h-auto lg:min-h-0 lg:flex-1",
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.monthlyComparison}
                margin={{ left: compact ? -12 : 0, right: 8 }}
              >
                <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  axisLine={{ stroke: chartGridColor }}
                  tickLine={{ stroke: chartGridColor }}
                  tick={{ fill: chartTextColor, fontSize: 11 }}
                />
                <YAxis
                  axisLine={{ stroke: chartGridColor }}
                  tickLine={{ stroke: chartGridColor }}
                  tick={{ fill: chartTextColor, fontSize: 11 }}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                {!compact && <Legend wrapperStyle={{ color: chartTextColor, fontSize: 12 }} />}
                <Line
                  type="monotone"
                  dataKey="abertas"
                  name="Abertas"
                  stroke={lineOpenColor}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="resolvidas"
                  name="Resolvidas"
                  stroke={lineResolvedColor}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card
          className={cn("lg:col-span-3", compact && "flex min-h-0 flex-col lg:col-span-1")}
        >
          <CardHeader className={cn(compact && "shrink-0 p-4 pb-2")}>
            <CardTitle className={cn(compact && "text-sm")}>Ocorrências por categoria</CardTitle>
          </CardHeader>
          <CardContent
            className={cn(
              "h-72 sm:h-80",
              compact && "h-[230px] sm:h-[250px] lg:h-auto lg:min-h-0 lg:flex-1",
            )}
          >
            {categoryData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhuma ocorrência categorizada no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 18, right: 8, left: -8, bottom: 8 }}
                  barCategoryGap={compact ? "14%" : "18%"}
                >
                  <CartesianGrid
                    stroke={chartGridColor}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
                    axisLine={{ stroke: chartGridColor }}
                    tickLine={{ stroke: chartGridColor }}
                    tick={{ fill: chartTextColor, fontSize: 11 }}
                    interval={0}
                    tickFormatter={(value) =>
                      CATEGORY_TICK_LABELS[String(value)] ?? String(value)
                    }
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={{ stroke: chartGridColor }}
                    tickLine={{ stroke: chartGridColor }}
                    tick={{ fill: chartTextColor, fontSize: 11 }}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="total" fill={categoryBarColor} radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="total"
                      position="top"
                      style={{ fill: chartTextColor, fontSize: 11, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
