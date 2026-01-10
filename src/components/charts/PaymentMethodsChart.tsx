"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentMethodsChartProps {
  data: {
    cash: number;
    card: number;
    transfer: number;
  };
  isLoading?: boolean;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"];

export function PaymentMethodsChart({ data, isLoading }: PaymentMethodsChartProps) {
  const chartData = [
    { name: "Efectivo", value: data.cash },
    { name: "Tarjeta", value: data.card },
    { name: "Transferencia", value: data.transfer },
  ].filter((item) => item.value > 0);

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Métodos de pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Métodos de pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Sin datos
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Métodos de pago</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              label={({ percent }) => ((percent ?? 0) * 100).toFixed(0) + "%"}
            >
              {chartData.map((_, index) => (
                <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card)/0.8)",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                backdropFilter: "blur(4px)",
              }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
