import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Transaction, Expense } from "@/types/database";

interface YearData {
  year: string;
  ingresos: number;
  gastos: number;
  beneficio: number;
  transacciones: number;
}

interface GrowthMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
}

interface YearComparisonResult {
  yearData: YearData[];
  growthMetrics: GrowthMetric[];
}

export function useYearComparison() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["yearComparison"],
    queryFn: async (): Promise<YearComparisonResult> => {
      const years = [2022, 2023, 2024, 2025, 2026];
      const yearData: YearData[] = [];

      for (const year of years) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data: transactionsData, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .gte("date", startDate)
          .lte("date", endDate);

        if (txError) throw txError;

        const { data: expensesData, error: expError } = await supabase
          .from("expenses")
          .select("*")
          .gte("date", startDate)
          .lte("date", endDate);

        if (expError) throw expError;

        const transactions = (transactionsData || []) as Transaction[];
        const expenses = (expensesData || []) as Expense[];

        const ingresos = transactions.reduce((acc, tx) => acc + tx.total_amount, 0);
        const gastos = expenses.reduce((acc, exp) => acc + exp.total_amount, 0);

        yearData.push({
          year: year.toString(),
          ingresos,
          gastos,
          beneficio: ingresos - gastos,
          transacciones: transactions.length,
        });
      }

      const formatCurrency = (value: number) =>
        new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);

      const currentYear = new Date().getFullYear();
      const currentYearData = yearData.find((d) => d.year === currentYear.toString());
      const previousYearData = yearData.find((d) => d.year === (currentYear - 1).toString());

      const growthMetrics: GrowthMetric[] = [];

      if (currentYearData && previousYearData) {
        const ingresosChange = previousYearData.ingresos
          ? ((currentYearData.ingresos - previousYearData.ingresos) / previousYearData.ingresos) * 100
          : 0;
        const beneficioChange = previousYearData.beneficio
          ? ((currentYearData.beneficio - previousYearData.beneficio) / previousYearData.beneficio) * 100
          : 0;

        growthMetrics.push(
          {
            label: "Ingresos",
            value: formatCurrency(currentYearData.ingresos),
            change: Math.round(Math.abs(ingresosChange)),
            trend: ingresosChange >= 0 ? "up" : "down",
          },
          {
            label: "Beneficio Neto",
            value: formatCurrency(currentYearData.beneficio),
            change: Math.round(Math.abs(beneficioChange)),
            trend: beneficioChange >= 0 ? "up" : "down",
          },
          {
            label: "Transacciones",
            value: currentYearData.transacciones.toString(),
            change: Math.round(
              Math.abs(
                previousYearData.transacciones
                  ? ((currentYearData.transacciones - previousYearData.transacciones) /
                      previousYearData.transacciones) *
                      100
                  : 0
              )
            ),
            trend:
              currentYearData.transacciones >= previousYearData.transacciones ? "up" : "down",
          }
        );
      }

      return { yearData, growthMetrics };
    },
  });
}
