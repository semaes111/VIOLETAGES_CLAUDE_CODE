"use client";

import * as React from "react";
import { format, subDays, subWeeks, subMonths, subQuarters, subYears } from "date-fns";
import { es } from "date-fns/locale";
import { RefreshCw, DollarSign, Users, CreditCard, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { PaymentMethodsChart } from "@/components/charts/PaymentMethodsChart";
import { TopTreatmentsChart } from "@/components/charts/TopTreatmentsChart";
import { HeatmapChart } from "@/components/charts/HeatmapChart";
import { TransactionsTable } from "@/components/tables/TransactionsTable";
import { useTransactions, useTransactionStats } from "@/hooks/useTransactions";

type Period = "today" | "week" | "month" | "quarter" | "year" | "custom";

const periodOptions = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" },
];

function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const to = format(now, "yyyy-MM-dd");
  let from: string;

  switch (period) {
    case "today":
      from = to;
      break;
    case "week":
      from = format(subWeeks(now, 1), "yyyy-MM-dd");
      break;
    case "month":
      from = format(subMonths(now, 1), "yyyy-MM-dd");
      break;
    case "quarter":
      from = format(subQuarters(now, 1), "yyyy-MM-dd");
      break;
    case "year":
      from = format(subYears(now, 1), "yyyy-MM-dd");
      break;
    default:
      from = format(subMonths(now, 1), "yyyy-MM-dd");
  }

  return { from, to };
}

export default function DashboardPage() {
  const [period, setPeriod] = React.useState<Period>("month");
  const [page, setPage] = React.useState(1);

  const dateRange = getDateRange(period);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useTransactionStats(
    dateRange.from,
    dateRange.to
  );

  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useTransactions({
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    page,
    pageSize: 5,
  });

  const handleRefresh = () => {
    refetchStats();
    refetchTransactions();
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  // Mock data for charts (in real app, this would come from API)
  const revenueChartData = React.useMemo(() => {
    const days = period === "today" ? 1 : period === "week" ? 7 : period === "month" ? 30 : 90;
    return Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return {
        date: format(date, "dd/MM", { locale: es }),
        total: Math.random() * 1000 + 200,
        medical: Math.random() * 400 + 100,
        aesthetic: Math.random() * 300 + 100,
        cosmetic: Math.random() * 200 + 50,
      };
    });
  }, [period]);

  const topTreatmentsData = React.useMemo(
    () => [
      { name: "Botox", count: 45, revenue: 4500 },
      { name: "Ácido Hialurónico", count: 38, revenue: 3800 },
      { name: "Peeling", count: 32, revenue: 1600 },
      { name: "Mesoterapia", count: 28, revenue: 2100 },
      { name: "Láser", count: 22, revenue: 2200 },
    ],
    []
  );

  const heatmapData = React.useMemo(() => {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const data: Array<{ day: string; hour: number; value: number }> = [];

    days.forEach((day) => {
      for (let hour = 8; hour <= 19; hour++) {
        data.push({
          day,
          hour,
          value: Math.floor(Math.random() * 10),
        });
      }
    });

    return data;
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Resumen de actividad de la clínica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as Period)}
          >
            <SelectTrigger className="w-[140px] glass">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} className="glass hover:bg-white/20">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Ingresos totales"
          value={formatCurrency(stats?.totalAmount ?? 0)}
          description="vs periodo anterior"
          trend={{ value: 12.5, isPositive: true }}
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          className="border-none shadow-lg shadow-primary/5"
        />
        <KPICard
          title="Transacciones"
          value={stats?.count ?? 0}
          description="vs periodo anterior"
          trend={{ value: 8.2, isPositive: true }}
          icon={<TrendingUp className="h-4 w-4 text-secondary" />}
          className="border-none shadow-lg shadow-secondary/5"
        />
        <KPICard
          title="Ticket promedio"
          value={formatCurrency(
            stats?.count ? (stats.totalAmount / stats.count) : 0
          )}
          description="por transacción"
          icon={<CreditCard className="h-4 w-4 text-accent" />}
          className="border-none shadow-lg shadow-accent/5"
        />
        <KPICard
          title="Pacientes activos"
          value={Math.floor(Math.random() * 50) + 100}
          description="en el período"
          trend={{ value: 5.1, isPositive: true }}
          icon={<Users className="h-4 w-4 text-green-500" />}
          className="border-none"
        />
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">
        <RevenueChart data={revenueChartData} isLoading={statsLoading} />
        <PaymentMethodsChart
          data={{
            cash: stats?.cashAmount ?? 0,
            card: stats?.cardAmount ?? 0,
            transfer: stats?.transferAmount ?? 0,
          }}
          isLoading={statsLoading}
        />
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
        <TopTreatmentsChart data={topTreatmentsData} />
        <HeatmapChart data={heatmapData} />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={item}>
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Últimas transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsTable
              data={transactions?.data ?? []}
              isLoading={transactionsLoading}
              page={page}
              pageSize={5}
              totalPages={transactions?.totalPages ?? 1}
              totalCount={transactions?.count ?? 0}
              onPageChange={setPage}
              onPageSizeChange={() => {}}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
