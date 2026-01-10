"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ExpenseInsert, Supplier } from "@/types/database";

const expenseSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  supplier_id: z.string().optional(),
  category: z.enum(
    ["supplies", "equipment", "rent", "utilities", "marketing", "other"],
    {
      required_error: "Selecciona una categoría",
    }
  ),
  description: z.string().min(3, "La descripción es requerida"),
  amount: z.coerce.number().min(0, "El importe no puede ser negativo"),
  iva_amount: z.coerce.number().min(0).default(0),
  total_amount: z.coerce.number().min(0),
  invoice_number: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  suppliers: Supplier[];
  defaultValues?: Partial<ExpenseFormValues> & { date?: string | Date };
  onSubmit: (data: ExpenseInsert) => Promise<void>;
  isLoading?: boolean;
}

export function ExpenseForm({
  suppliers,
  defaultValues,
  onSubmit,
  isLoading,
}: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      ...defaultValues,
      // Ensure date is a Date object if passed as string
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
    },
  });

  // Watch values to auto-calculate total
  const amount = form.watch("amount");
  const iva_amount = form.watch("iva_amount");

  useEffect(() => {
    const total = (Number(amount) || 0) + (Number(iva_amount) || 0);
    form.setValue("total_amount", total);
  }, [amount, iva_amount, form]);

  const handleSubmit = async (values: ExpenseFormValues) => {
    await onSubmit({
      ...values,
      date: values.date.toISOString(),
      supplier_id: values.supplier_id || null, // handle empty string as null
      invoice_number: values.invoice_number || null,
      notes: values.notes || null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal glass",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº Factura</FormLabel>
                <FormControl>
                  <Input placeholder="F-2024-001" className="glass" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
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
                    <SelectItem value="supplies">Suministros</SelectItem>
                    <SelectItem value="equipment">Equipamiento</SelectItem>
                    <SelectItem value="rent">Alquiler</SelectItem>
                    <SelectItem value="utilities">Servicios</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ""} 
                >
                  <FormControl>
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">-- Sin proveedor --</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Compra de material..." className="glass" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" className="glass" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iva_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IVA (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" className="glass" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="total_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" className="bg-muted" readOnly {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observaciones adicionales..." 
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
            {defaultValues?.amount ? "Guardar Cambios" : "Registrar Gasto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
