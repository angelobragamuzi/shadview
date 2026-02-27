"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DashboardMetrics } from "@/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

const PIE_COLORS = ["#0f4c81", "#2d6fa3", "#4d8cc0", "#7eaed2", "#9ebfde"];

export function MetricsCharts({
  metrics,
  compact = false,
}: {
  metrics: DashboardMetrics;
  compact?: boolean;
}) {
  const categoryData = Object.entries(metrics.byCategory).map(([key, value]) => ({
    category: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] ?? key,
    total: value,
  }));

  const statusData = Object.entries(metrics.byStatus).map(([key, value]) => ({
    status: STATUS_LABELS[key as keyof typeof STATUS_LABELS] ?? key,
    total: value,
  }));

  return (
    <div
      className={cn(
        "grid gap-4 xl:grid-cols-3",
        compact && "h-full min-h-0 gap-3 xl:grid-cols-[1.7fr_1fr]",
      )}
    >
      <Card className={cn("xl:col-span-2", compact && "flex min-h-0 flex-col xl:col-span-1")}>
        <CardHeader className={cn(compact && "shrink-0 p-4 pb-2")}>
          <CardTitle className={cn(compact && "text-sm")}>Comparativo mensal</CardTitle>
        </CardHeader>
        <CardContent
          className={cn("h-80", compact && "h-[260px] xl:h-auto xl:min-h-0 xl:flex-1")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="abertas"
                name="Abertas"
                stroke="#0f4c81"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="resolvidas"
                name="Resolvidas"
                stroke="#35a46b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className={cn(compact ? "grid min-h-0 gap-3 xl:grid-rows-2" : "xl:col-span-1")}>
        <Card className={cn(compact && "flex min-h-0 flex-col")}>
          <CardHeader className={cn(compact && "shrink-0 p-4 pb-2")}>
            <CardTitle className={cn(compact && "text-sm")}>Status atual</CardTitle>
          </CardHeader>
          <CardContent
            className={cn("h-80", compact && "h-[220px] xl:h-auto xl:min-h-0 xl:flex-1")}
          >
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
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card
          className={cn("xl:col-span-3", compact && "flex min-h-0 flex-col xl:col-span-1")}
        >
          <CardHeader className={cn(compact && "shrink-0 p-4 pb-2")}>
            <CardTitle className={cn(compact && "text-sm")}>Ocorrencias por categoria</CardTitle>
          </CardHeader>
          <CardContent
            className={cn("h-80", compact && "h-[220px] xl:h-auto xl:min-h-0 xl:flex-1")}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#0f4c81" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
