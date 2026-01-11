import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  TransactionWithDetails,
} from "@/types/database";

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  types?: string[];
  paymentMethods?: string[];
  patientId?: string;
  treatmentIds?: string[];
  amountMin?: number;
  amountMax?: number;
  page?: number;
  pageSize?: number;
}

interface TransactionStats {
  totalAmount: number;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  medicalAmount: number;
  aestheticAmount: number;
  cosmeticAmount: number;
  count: number;
}

interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Get paginated transactions with filters
export function useTransactions(filters: TransactionFilters = {}) {
  const supabase = createClient();
  const { page = 1, pageSize = 10, ...queryFilters } = filters;

  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async (): Promise<PaginatedResult<TransactionWithDetails>> => {
      let query = supabase
        .from("transactions")
        .select(
          `
          *,
          patient:patients(*),
          items:transaction_items(*, treatment:treatments(*))
        `,
          { count: "exact" }
        )
        .order("date", { ascending: false });

      // Apply filters
      if (queryFilters.dateFrom) {
        query = query.gte("date", queryFilters.dateFrom);
      }
      if (queryFilters.dateTo) {
        query = query.lte("date", queryFilters.dateTo);
      }
      if (queryFilters.patientId) {
        query = query.eq("patient_id", queryFilters.patientId);
      }
      if (queryFilters.amountMin !== undefined) {
        query = query.gte("total_amount", queryFilters.amountMin);
      }
      if (queryFilters.amountMax !== undefined) {
        query = query.lte("total_amount", queryFilters.amountMax);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: (data as unknown as TransactionWithDetails[]) || [],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
  });
}

// Get single transaction
export function useTransaction(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async (): Promise<TransactionWithDetails> => {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          patient:patients(*),
          items:transaction_items(*, treatment:treatments(*))
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as TransactionWithDetails;
    },
    enabled: !!id,
  });
}

// Get transaction stats for a period
export function useTransactionStats(dateFrom?: string, dateTo?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["transactionStats", dateFrom, dateTo],
    queryFn: async (): Promise<TransactionStats> => {
      let query = supabase.from("transactions").select("*");

      if (dateFrom) {
        query = query.gte("date", dateFrom);
      }
      if (dateTo) {
        query = query.lte("date", dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transactions = data as Transaction[];

      return transactions.reduce(
        (acc, t) => ({
          totalAmount: acc.totalAmount + t.total_amount,
          cashAmount: acc.cashAmount + t.cash_amount,
          cardAmount: acc.cardAmount + t.card_amount,
          transferAmount: acc.transferAmount + t.transfer_amount,
          medicalAmount: acc.medicalAmount + t.medical_amount,
          aestheticAmount: acc.aestheticAmount + t.aesthetic_amount,
          cosmeticAmount: acc.cosmeticAmount + t.cosmetic_amount,
          count: acc.count + 1,
        }),
        {
          totalAmount: 0,
          cashAmount: 0,
          cardAmount: 0,
          transferAmount: 0,
          medicalAmount: 0,
          aestheticAmount: 0,
          cosmeticAmount: 0,
          count: 0,
        }
      );
    },
  });
}

// Create transaction
export function useCreateTransaction() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: TransactionInsert & {
        items: Array<{
          treatment_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        }>;
      }
    ) => {
      const { items, ...transactionData } = data;

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction items
      if (items.length > 0) {
        const itemsWithTransactionId = items.map((item) => ({
          ...item,
          transaction_id: transaction.id,
        }));

        const { error: itemsError } = await supabase
          .from("transaction_items")
          .insert(itemsWithTransactionId);

        if (itemsError) throw itemsError;
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
    },
  });
}

// Update transaction
export function useUpdateTransaction() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: TransactionUpdate;
    }) => {
      const { data: transaction, error } = await supabase
        .from("transactions")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return transaction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
    },
  });
}

// Delete transaction
export function useDeleteTransaction() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete items first
      await supabase.from("transaction_items").delete().eq("transaction_id", id);

      // Delete transaction
      const { error } = await supabase.from("transactions").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
    },
  });
}
