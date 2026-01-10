"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { usePatients } from "@/hooks/usePatients";
import { useCreateAppointment, useUpdateAppointment } from "@/hooks/useAppointments";
import { Appointment, AppointmentStatus } from "@/types/database";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const appointmentSchema = z.object({
  patient_id: z.string().min(1, "El paciente es requerido"),
  start_time: z.string().min(1, "La fecha de inicio es requerida"),
  end_time: z.string().min(1, "La fecha de fin es requerida"),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"] as const),
  notes: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  return end > start;
}, {
  message: "La fecha de fin debe ser posterior al inicio",
  path: ["end_time"],
});

type AppointmentFormProps = {
  initialData?: Appointment;
  onSuccess?: () => void;
  defaultDate?: Date;
};

export function AppointmentForm({ initialData, onSuccess, defaultDate }: AppointmentFormProps) {
  const { data: patientsResult, isLoading: isLoadingPatients } = usePatients({ pageSize: 1000, status: 'active' });
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();

  const isEditing = !!initialData;

  // Helper to format Date to datetime-local string (yyyy-MM-ddTHH:mm)
  const toDateTimeLocal = (dateStr?: string | Date) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return format(d, "yyyy-MM-dd'T'HH:mm");
  };

  const defaultStart = defaultDate 
    ? toDateTimeLocal(defaultDate) 
    : toDateTimeLocal(new Date());
    
  // Default end time is 1 hour later
  const getDefaultEnd = () => {
    const d = defaultDate ? new Date(defaultDate) : new Date();
    d.setHours(d.getHours() + 1);
    return toDateTimeLocal(d);
  }

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: initialData?.patient_id || "",
      start_time: initialData?.start_time ? toDateTimeLocal(initialData.start_time) : defaultStart,
      end_time: initialData?.end_time ? toDateTimeLocal(initialData.end_time) : getDefaultEnd(),
      status: (initialData?.status as AppointmentStatus) || "scheduled",
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof appointmentSchema>) => {
    try {
      const payload = {
        ...values,
        // Convert datetime-local string back to ISO string for DB
        start_time: new Date(values.start_time).toISOString(),
        end_time: new Date(values.end_time).toISOString(),
        notes: values.notes || null,
      };

      if (isEditing && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, ...payload });
        toast.success("Cita actualizada");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Cita agendada");
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la cita");
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patient_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isLoadingPatients}>
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patientsResult?.data.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inicio</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fin</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="no_show">No Asistió</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Detalles de la cita..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Guardar Cambios" : "Agendar Cita"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
