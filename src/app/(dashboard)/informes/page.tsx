"use client";

import { useState } from "react";
import { 
  Calendar, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users,
  Activity
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { PaymentMethodsChart } from "@/components/charts/PaymentMethodsChart";
import { TopTreatmentsChart } from "@/components/charts/TopTreatmentsChart";
import { useReports, DateRangeType } from "@/hooks/useReports";

export default function InformesPage() {
  const [range, setRange] = useState<DateRangeType>("month");
  const { data, isLoading } = useReports({ range });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  return (
    <div className="space-y-6  p-8 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
            Informes y Estadísticas
          </h1>
          <p className="text-muted-foreground mt-2">
            Análisis financiero y métricas operativas de la clínica.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select
            value={range}
            onValueChange={(value) => setRange(value as DateRangeType)}
          >
            <SelectTrigger className="w-[180px] glass">
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data?.summary.totalIncome || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              En el periodo seleccionado
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <CreditCard className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(data?.summary.totalExpenses || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              En el periodo seleccionado
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(data?.summary.netProfit || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Ingresos - Gastos
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas / Transacciones</CardTitle>
            <Users className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                {data?.summary.totalVisits || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Operaciones realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RevenueChart data={data?.revenueData || []} isLoading={isLoading} />
        </div>
        <div className="col-span-3">
          <PaymentMethodsChart 
            data={data?.paymentMethods || { cash: 0, card: 0, transfer: 0 }} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <TopTreatmentsChart data={data?.topTreatments || []} isLoading={isLoading} />
        
        {/* Placeholder for future specific stats or map */}
        <Card className="glass-card flex flex-col justify-center items-center p-6 text-center text-muted-foreground border-dashed">
             <Activity className="h-12 w-12 mb-4 opacity-50" />
             <h3 className="text-lg font-medium">Próximamente: Análisis de Retención</h3>
             <p className="text-sm max-w-xs mt-2">
               Estamos trabajando en métricas avanzadas para medir la recurrencia de pacientes.
             </p>
        </Card>
      </div>
    </div>
  );
}
