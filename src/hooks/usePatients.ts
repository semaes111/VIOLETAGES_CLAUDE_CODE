import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

import type {
  Patient,
  PatientInsert,
  PatientUpdate,
} from "@/types/database";

export interface PatientFilters {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Get paginated patients with filters
export function usePatients(filters: PatientFilters = {}) {
  const supabase = createClient();
  const { page = 1, pageSize = 10, search, status } = filters;

  return useQuery({
    queryKey: ["patients", filters],
    queryFn: async (): Promise<PaginatedResult<Patient>> => {
      let query = supabase
        .from("patients")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: (data as Patient[]) || [],
        count: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      };
    },
  });
}

// Get single patient
export function usePatient(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["patient", id],
    queryFn: async (): Promise<Patient> => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Patient;
    },
    enabled: !!id,
  });
}

// Create patient
export function useCreatePatient() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PatientInsert) => {
      const { data: patient, error } = await supabase
        .from("patients")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

// Update patient
export function useUpdatePatient() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PatientUpdate }) => {
      const { data: patient, error } = await supabase
        .from("patients")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return patient;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", variables.id] });
    },
  });
}

// Delete patient
export function useDeletePatient() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
