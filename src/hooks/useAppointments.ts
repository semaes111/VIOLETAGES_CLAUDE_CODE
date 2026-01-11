import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AppointmentInsert, AppointmentUpdate, AppointmentWithPatient } from "@/types/database";

export function useAppointments(start?: Date, end?: Date) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["appointments", start, end],
    queryFn: async () => {
      let query = supabase
        .schema("violeta_gest")
        .from("appointments")
        .select("*, patient:patients(id, name, phone, email)")
        .order("start_time", { ascending: true });

      if (start) {
        query = query.gte("start_time", start.toISOString());
      }
      if (end) {
        query = query.lte("end_time", end.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as AppointmentWithPatient[];
    },
  });
}

export function useCreateAppointment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAppointment: AppointmentInsert) => {
      const { data, error } = await supabase
        .schema("violeta_gest")
        .from("appointments")
        .insert(newAppointment)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AppointmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .schema("violeta_gest")
        .from("appointments")
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
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useDeleteAppointment() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .schema("violeta_gest")
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
