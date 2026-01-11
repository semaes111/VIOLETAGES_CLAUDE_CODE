import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, subDays, format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Transaction, Expense, TransactionItem } from "@/types/database";

export type DateRangeType = "30days" | "month" | "year";

interface UseReportsOptions {
  range: DateRangeType;
  year?: string;
}

export function useReports({ range, year }: UseReportsOptions) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["reports", range, year],
    queryFn: async () => {
      // 1. Determine date range
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      const selectedYear = year && year !== "all" ? parseInt(year) : now.getFullYear();

      if (range === "30days") {
        startDate = subDays(now, 30);
        endDate = now;
      } else if (range === "month") {
        const referenceDate = new Date(selectedYear, now.getMonth(), 1);
        startDate = startOfMonth(referenceDate);
        endDate = endOfMonth(referenceDate);
      } else {
        if (year === "all") {
          startDate = new Date(2022, 0, 1);
          endDate = new Date(2026, 11, 31);
        } else {
          startDate = new Date(selectedYear, 0, 1);
          endDate = new Date(selectedYear, 11, 31);
        }
      }

      const strStartDate = format(startDate, "yyyy-MM-dd");
      const strEndDate = format(endDate, "yyyy-MM-dd");

      // 2. Fetch Transactions
      const { data: transactionsData, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", strStartDate)
        .lte("date", strEndDate);

      if (txError) throw txError;
      const transactions = (transactionsData || []) as Transaction[];

      // 3. Fetch Expenses
      const { data: expensesData, error: expError } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", strStartDate)
        .lte("date", strEndDate);

      if (expError) throw expError;
      const expenses = (expensesData || []) as Expense[];

      // 4. Fetch Transaction Items (for Top Treatments)
      // We join with treatments to get names
      const { data: itemsData, error: itemsError } = await supabase
        .from("transaction_items")
        .select("*, treatment:treatments(name)")
        .gte("created_at", strStartDate)
        .lte("created_at", strEndDate);
      
      if (itemsError) throw itemsError;
      
      const items = (itemsData || []) as (TransactionItem & { treatment: { name: string } | null })[];


      // --- Aggregation Logic ---

      // Summary
      const totalIncome = transactions.reduce((acc, tx) => acc + tx.total_amount, 0);
      const totalExpenses = expenses.reduce((acc, exp) => acc + exp.total_amount, 0);
      const netProfit = totalIncome - totalExpenses;
      const totalVisits = transactions.length;

      // Revenue by Date
      const revenueMap = new Map<string, { date: string; total: number; medical: number; aesthetic: number; cosmetic: number }>();
      
      transactions.forEach(tx => {
        const dateKey = format(parseISO(tx.date), "yyyy-MM-dd");
        if (!revenueMap.has(dateKey)) {
          revenueMap.set(dateKey, { date: dateKey, total: 0, medical: 0, aesthetic: 0, cosmetic: 0 });
        }
        const entry = revenueMap.get(dateKey)!;
        entry.total += tx.total_amount;
        entry.medical += tx.medical_amount;
        entry.aesthetic += tx.aesthetic_amount;
        entry.cosmetic += tx.cosmetic_amount;
      });

      const revenueData = Array.from(revenueMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      // Payment Methods
      const paymentMethods = {
        cash: 0,
        card: 0,
        transfer: 0,
      };

      transactions.forEach(tx => {
        paymentMethods.cash += tx.cash_amount;
        paymentMethods.card += tx.card_amount;
        paymentMethods.transfer += tx.transfer_amount;
      });

      // Top Treatments
      const treatmentMap = new Map<string, { name: string; count: number; revenue: number }>();
      
      items.forEach(item => {
        const name = item.treatment?.name || "Desconocido";
        if (!treatmentMap.has(name)) {
          treatmentMap.set(name, { name, count: 0, revenue: 0 });
        }
        const entry = treatmentMap.get(name)!;
        entry.count += item.quantity;
        entry.revenue += item.subtotal;
      });

      const topTreatments = Array.from(treatmentMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        summary: {
          totalIncome,
          totalExpenses,
          netProfit,
          totalVisits,
        },
        revenueData,
        paymentMethods,
        topTreatments,
      };
    },
  });
}
