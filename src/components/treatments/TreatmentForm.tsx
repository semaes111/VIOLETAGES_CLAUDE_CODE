"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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
import { TreatmentInsert, Category } from "@/types/database";

const treatmentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres"),
  category_id: z.string().min(1, "Selecciona una categoría"),
  type: z.enum(["medical", "aesthetic", "cosmetic"], {
    required_error: "Selecciona un tipo",
  }),
  base_price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  base_time_mins: z.coerce.number().min(1, "La duración debe ser al menos 1 minuto"),
  complexity_score: z.coerce.number().min(1).max(10).default(1),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type TreatmentFormValues = z.infer<typeof treatmentSchema>;

interface TreatmentFormProps {
  categories: Category[];
  defaultValues?: Partial<TreatmentFormValues>;
  onSubmit: (data: TreatmentInsert) => Promise<void>;
  isLoading?: boolean;
}

export function TreatmentForm({
  categories,
  defaultValues,
  onSubmit,
  isLoading,
}: TreatmentFormProps) {
  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "aesthetic",
      base_price: 0,
      base_time_mins: 30,
      complexity_score: 1,
      description: "",
      is_active: true,
      ...defaultValues,
    },
  });

  const handleSubmit = async (values: TreatmentFormValues) => {
    await onSubmit({
      ...values,
      description: values.description || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="TRT-001" className="glass" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Tratamiento</FormLabel>
              <FormControl>
                <Input placeholder="Limpieza Facial Profunda" className="glass" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="medical">Médico</SelectItem>
                    <SelectItem value="aesthetic">Estético</SelectItem>
                    <SelectItem value="cosmetic">Cosmético</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="base_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Base (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" className="glass" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="base_time_mins"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (min)</FormLabel>
                <FormControl>
                  <Input type="number" className="glass" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="complexity_score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complejidad (1-10)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="10" className="glass" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detalles del procedimiento..." 
                  className="resize-none glass" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {defaultValues ? "Guardar Cambios" : "Crear Tratamiento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
