import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Treatment, TreatmentInsert, Category, Database } from "@/types/database";

// --- Categories Hooks ---

export function useCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("violeta_gest")
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Category[];
    },
  });
}

export function useCreateCategory() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCategory: Omit<Category, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .schema("violeta_gest")
        .from("categories")
        .insert(newCategory)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .schema("violeta_gest")
        .from("categories")
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
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .schema("violeta_gest")
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// --- Treatments Hooks ---

interface UseTreatmentsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
}

export function useTreatments({ page = 1, pageSize = 10, search = "", categoryId }: UseTreatmentsOptions = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["treatments", page, pageSize, search, categoryId],
    queryFn: async () => {
      let query = supabase
        .schema("violeta_gest")
        .from("treatments")
        .select("*, category:categories(*)", { count: "exact" });

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      if (categoryId && categoryId !== "all") {
        query = query.eq("category_id", categoryId);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data as (Treatment & { category: Category })[],
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      };
    },
  });
}

export function useCreateTreatment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTreatment: TreatmentInsert) => {
      const { data, error } = await supabase
        .schema("violeta_gest")
        .from("treatments")
        .insert(newTreatment)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
  });
}

export function useUpdateTreatment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Database["public"]["Tables"]["treatments"]["Update"] & { id: string }) => {
      const { data, error } = await supabase
        .schema("violeta_gest")
        .from("treatments")
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
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
  });
}

export function useDeleteTreatment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .schema("violeta_gest")
        .from("treatments")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
  });
}
