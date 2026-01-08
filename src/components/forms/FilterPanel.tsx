"use client";

import * as React from "react";
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X, Filter, RotateCcw } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export interface FilterValues {
  dateFrom?: string;
  dateTo?: string;
  types: string[];
  paymentMethods: string[];
  amountMin?: number;
  amountMax?: number;
}

interface FilterPanelProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
}

const datePresets = [
  { label: "Hoy", getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: "Ayer", getValue: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: "Última semana", getValue: () => ({ from: startOfDay(subWeeks(new Date(), 1)), to: endOfDay(new Date()) }) },
  { label: "Último mes", getValue: () => ({ from: startOfDay(subMonths(new Date(), 1)), to: endOfDay(new Date()) }) },
];

const transactionTypes = [
  { id: "medical", label: "Médico", color: "bg-blue-500" },
  { id: "aesthetic", label: "Estético", color: "bg-green-500" },
  { id: "cosmetic", label: "Cosmética", color: "bg-orange-500" },
];

const paymentMethods = [
  { id: "cash", label: "Efectivo" },
  { id: "card", label: "Tarjeta" },
  { id: "transfer", label: "Transferencia" },
];

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    filters.dateFrom && filters.dateTo
      ? { from: new Date(filters.dateFrom), to: new Date(filters.dateTo) }
      : undefined
  );

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onFiltersChange({
      ...filters,
      dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
      dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
    });
  };

  const handlePresetClick = (preset: typeof datePresets[0]) => {
    const range = preset.getValue();
    handleDateRangeChange(range);
  };

  const handleTypeToggle = (typeId: string) => {
    const newTypes = filters.types.includes(typeId)
      ? filters.types.filter((t) => t !== typeId)
      : [...filters.types, typeId];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handlePaymentMethodToggle = (methodId: string) => {
    const newMethods = filters.paymentMethods.includes(methodId)
      ? filters.paymentMethods.filter((m) => m !== methodId)
      : [...filters.paymentMethods, methodId];
    onFiltersChange({ ...filters, paymentMethods: newMethods });
  };

  const handleAmountChange = (field: "amountMin" | "amountMax", value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    onFiltersChange({ ...filters, [field]: numValue });
  };

  const clearFilters = () => {
    setDateRange(undefined);
    onFiltersChange({
      dateFrom: undefined,
      dateTo: undefined,
      types: [],
      paymentMethods: [],
      amountMin: undefined,
      amountMax: undefined,
    });
  };

  const removeFilter = (key: keyof FilterValues, value?: string) => {
    if (key === "dateFrom" || key === "dateTo") {
      setDateRange(undefined);
      onFiltersChange({ ...filters, dateFrom: undefined, dateTo: undefined });
    } else if (key === "types" && value) {
      handleTypeToggle(value);
    } else if (key === "paymentMethods" && value) {
      handlePaymentMethodToggle(value);
    } else if (key === "amountMin" || key === "amountMax") {
      onFiltersChange({ ...filters, [key]: undefined });
    }
  };

  const activeFiltersCount =
    (filters.dateFrom ? 1 : 0) +
    filters.types.length +
    filters.paymentMethods.length +
    (filters.amountMin !== undefined ? 1 : 0) +
    (filters.amountMax !== undefined ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yy", { locale: es })} -{" "}
                    {format(dateRange.to, "dd/MM/yy", { locale: es })}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy", { locale: es })
                )
              ) : (
                "Seleccionar fecha"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              <div className="border-r p-2">
                <div className="space-y-1">
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Type Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Tipo
              {filters.types.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.types.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="space-y-2">
              {transactionTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.id}`}
                    checked={filters.types.includes(type.id)}
                    onCheckedChange={() => handleTypeToggle(type.id)}
                  />
                  <Label
                    htmlFor={`type-${type.id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className={cn("h-2 w-2 rounded-full", type.color)} />
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Payment Method Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              Método de pago
              {filters.paymentMethods.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.paymentMethods.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`method-${method.id}`}
                    checked={filters.paymentMethods.includes(method.id)}
                    onCheckedChange={() => handlePaymentMethodToggle(method.id)}
                  />
                  <Label htmlFor={`method-${method.id}`} className="cursor-pointer">
                    {method.label}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Amount Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              Importe
              {(filters.amountMin !== undefined || filters.amountMax !== undefined) && (
                <Badge variant="secondary" className="ml-2">1</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amountMin">Mínimo</Label>
                <Input
                  id="amountMin"
                  type="number"
                  placeholder="0.00"
                  value={filters.amountMin ?? ""}
                  onChange={(e) => handleAmountChange("amountMin", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountMax">Máximo</Label>
                <Input
                  id="amountMax"
                  type="number"
                  placeholder="0.00"
                  value={filters.amountMax ?? ""}
                  onChange={(e) => handleAmountChange("amountMax", e.target.value)}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Active Filters as Chips */}
      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {filters.dateFrom && filters.dateTo && (
              <Badge variant="secondary" className="gap-1">
                {format(new Date(filters.dateFrom), "dd/MM", { locale: es })} -{" "}
                {format(new Date(filters.dateTo), "dd/MM", { locale: es })}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("dateFrom")}
                />
              </Badge>
            )}
            {filters.types.map((type) => {
              const typeInfo = transactionTypes.find((t) => t.id === type);
              return (
                <Badge key={type} variant="secondary" className="gap-1">
                  <div className={cn("h-2 w-2 rounded-full", typeInfo?.color)} />
                  {typeInfo?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("types", type)}
                  />
                </Badge>
              );
            })}
            {filters.paymentMethods.map((method) => {
              const methodInfo = paymentMethods.find((m) => m.id === method);
              return (
                <Badge key={method} variant="secondary" className="gap-1">
                  {methodInfo?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter("paymentMethods", method)}
                  />
                </Badge>
              );
            })}
            {filters.amountMin !== undefined && (
              <Badge variant="secondary" className="gap-1">
                Min: {filters.amountMin}€
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("amountMin")}
                />
              </Badge>
            )}
            {filters.amountMax !== undefined && (
              <Badge variant="secondary" className="gap-1">
                Max: {filters.amountMax}€
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter("amountMax")}
                />
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
}
