import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Expense, ExpenseInsert, Supplier, Database } from "@/types/database";

// --- Suppliers Hooks ---

// --- Suppliers Hooks ---

export function useSuppliers() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Supplier[];
    },
  });
}

export function useCreateSupplier() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSupplier: Omit<Supplier, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("suppliers")
        .insert(newSupplier)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useDeleteSupplier() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

// --- Expenses Hooks ---

interface UseExpensesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
}

export function useExpenses({ page = 1, pageSize = 10, search = "", category }: UseExpensesOptions = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["expenses", page, pageSize, search, category],
    queryFn: async () => {
      let query = supabase
        .from("expenses")
        .select("*, supplier:suppliers(*)", { count: "exact" });

      if (search) {
        query = query.ilike("description", `%${search}%`);
      }

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order("date", { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data as (Expense & { supplier: Supplier | null })[],
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      };
    },
  });
}

export function useCreateExpense() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newExpense: ExpenseInsert) => {
      const { data, error } = await supabase
        .from("expenses")
        .insert(newExpense)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpense() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Database["public"]["Tables"]["expenses"]["Update"] & { id: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteExpense() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
