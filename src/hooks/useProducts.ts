import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types/database";

export function useProducts() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Fetch products and join with suppliers used in UI (name)
      const { data, error } = await supabase
        .from("products")
        .select("*, supplier:suppliers(name)")
        .order("name");
      
      if (error) {
        throw new Error(error.message);
      }
      
      // We manually cast the response to include the joined supplier name
      return data as (Product & { supplier: { name: string } | null })[];
    },
  });
}

export function useCreateProduct() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProduct: Omit<Product, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("products")
        .insert(newProduct)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
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
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
