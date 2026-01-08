"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Trash2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const transactionItemSchema = z.object({
  treatment_id: z.string().min(1, "Selecciona un tratamiento"),
  treatment_name: z.string(),
  treatment_type: z.enum(["medical", "aesthetic", "cosmetic"]),
  quantity: z.number().min(1, "Cantidad mínima: 1"),
  unit_price: z.number().min(0, "Precio no válido"),
  subtotal: z.number(),
});

const transactionFormSchema = z.object({
  date: z.date({ required_error: "La fecha es obligatoria" }),
  patient_id: z.string().min(1, "Selecciona un paciente"),
  patient_name: z.string().optional(),
  items: z.array(transactionItemSchema).min(1, "Añade al menos un tratamiento"),
  cash_amount: z.number().min(0).default(0),
  card_amount: z.number().min(0).default(0),
  transfer_amount: z.number().min(0).default(0),
  notes: z.string().optional(),
}).refine(
  (data) => {
    const total = data.items.reduce((sum, item) => sum + item.subtotal, 0);
    const paymentSum = data.cash_amount + data.card_amount + data.transfer_amount;
    return Math.abs(total - paymentSum) < 0.01;
  },
  {
    message: "La suma de los pagos debe ser igual al total",
    path: ["cash_amount"],
  }
);

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<TransactionFormData>;
  patients?: Array<{ id: string; name: string }>;
  treatments?: Array<{
    id: string;
    name: string;
    type: "medical" | "aesthetic" | "cosmetic";
    base_price: number;
    category?: { name: string };
  }>;
}

export function TransactionForm({
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
  patients = [],
  treatments = [],
}: TransactionFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      date: defaultValues?.date ?? new Date(),
      patient_id: defaultValues?.patient_id ?? "",
      items: defaultValues?.items ?? [],
      cash_amount: defaultValues?.cash_amount ?? 0,
      card_amount: defaultValues?.card_amount ?? 0,
      transfer_amount: defaultValues?.transfer_amount ?? 0,
      notes: defaultValues?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const watchDate = watch("date");
  const watchCash = watch("cash_amount");
  const watchCard = watch("card_amount");
  const watchTransfer = watch("transfer_amount");

  const total = watchItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const paymentSum = (watchCash || 0) + (watchCard || 0) + (watchTransfer || 0);
  const paymentDifference = total - paymentSum;

  const handleAddTreatment = (treatmentId: string) => {
    const treatment = treatments.find((t) => t.id === treatmentId);
    if (treatment) {
      append({
        treatment_id: treatment.id,
        treatment_name: treatment.name,
        treatment_type: treatment.type,
        quantity: 1,
        unit_price: treatment.base_price,
        subtotal: treatment.base_price,
      });
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const item = watchItems[index];
    if (item) {
      setValue(`items.${index}.quantity`, quantity);
      setValue(`items.${index}.subtotal`, quantity * item.unit_price);
    }
  };

  const handlePriceChange = (index: number, price: number) => {
    const item = watchItems[index];
    if (item) {
      setValue(`items.${index}.unit_price`, price);
      setValue(`items.${index}.subtotal`, item.quantity * price);
    }
  };

  // Group treatments by category
  const treatmentsByCategory = treatments.reduce((acc, treatment) => {
    const categoryName = treatment.category?.name ?? "Sin categoría";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(treatment);
    return acc;
  }, {} as Record<string, typeof treatments>);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label>Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watchDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchDate ? (
                  format(watchDate, "PPP", { locale: es })
                ) : (
                  "Seleccionar fecha"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={watchDate}
                onSelect={(date) => date && setValue("date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        {/* Patient Select */}
        <div className="space-y-2">
          <Label>Paciente</Label>
          <Select
            value={watch("patient_id")}
            onValueChange={(value) => setValue("patient_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.patient_id && (
            <p className="text-sm text-destructive">{errors.patient_id.message}</p>
          )}
        </div>
      </div>

      {/* Treatments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tratamientos</CardTitle>
          <CardDescription>Añade los tratamientos realizados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Treatment */}
          <div className="flex gap-2">
            <Select onValueChange={handleAddTreatment}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Añadir tratamiento..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(treatmentsByCategory).map(([category, categoryTreatments]) => (
                  <React.Fragment key={category}>
                    <SelectItem value={`__category_${category}`} disabled>
                      {category}
                    </SelectItem>
                    {categoryTreatments.map((treatment) => (
                      <SelectItem key={treatment.id} value={treatment.id}>
                        {treatment.name} - {treatment.base_price.toFixed(2)}€
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items List */}
          {fields.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr,80px,100px,100px,40px] gap-2 text-sm font-medium text-muted-foreground">
                <div>Tratamiento</div>
                <div className="text-center">Cant.</div>
                <div className="text-right">Precio</div>
                <div className="text-right">Subtotal</div>
                <div />
              </div>
              <Separator />
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr,80px,100px,100px,40px] gap-2 items-center"
                >
                  <div className="truncate">{watchItems[index]?.treatment_name}</div>
                  <Input
                    type="number"
                    min={1}
                    className="text-center"
                    value={watchItems[index]?.quantity ?? 1}
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value) || 1)
                    }
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    className="text-right"
                    value={watchItems[index]?.unit_price ?? 0}
                    onChange={(e) =>
                      handlePriceChange(index, parseFloat(e.target.value) || 0)
                    }
                  />
                  <div className="text-right font-medium">
                    {(watchItems[index]?.subtotal ?? 0).toFixed(2)}€
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Separator />
              <div className="flex justify-end">
                <div className="text-lg font-bold">Total: {total.toFixed(2)}€</div>
              </div>
            </div>
          )}

          {errors.items && (
            <p className="text-sm text-destructive">{errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Desglose de pago</CardTitle>
          <CardDescription>
            La suma debe ser igual al total ({total.toFixed(2)}€)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cash">Efectivo</Label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                min={0}
                {...register("cash_amount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card">Tarjeta</Label>
              <Input
                id="card"
                type="number"
                step="0.01"
                min={0}
                {...register("card_amount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer">Transferencia</Label>
              <Input
                id="transfer"
                type="number"
                step="0.01"
                min={0}
                {...register("transfer_amount", { valueAsNumber: true })}
              />
            </div>
          </div>
          {Math.abs(paymentDifference) > 0.01 && (
            <p className="mt-2 text-sm text-destructive">
              Diferencia: {paymentDifference > 0 ? "+" : ""}
              {paymentDifference.toFixed(2)}€
            </p>
          )}
          {errors.cash_amount && (
            <p className="mt-2 text-sm text-destructive">
              {errors.cash_amount.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Añade notas adicionales..."
          {...register("notes")}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar transacción
        </Button>
      </div>
    </form>
  );
}
