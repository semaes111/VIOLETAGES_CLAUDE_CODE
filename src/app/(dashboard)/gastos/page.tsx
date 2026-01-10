"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import {
  useExpenses,
  useSuppliers,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "@/hooks/useExpenses";
import type { Expense, ExpenseInsert } from "@/types/database";

export default function GastosPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { data: suppliers = [] } = useSuppliers();
  
  const { data, isLoading } = useExpenses({
    page,
    pageSize,
    search,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const handleCreate = async (data: ExpenseInsert) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateOpen(false);
      toast.success("Gasto registrado", {
        description: "El gasto se ha guardado correctamente.",
      });
    } catch {
      toast.error("Error", {
        description: "No se pudo registrar el gasto.",
      });
    }
  };

  const handleUpdate = async (data: ExpenseInsert) => {
    if (!editingExpense) return;
    
    try {
      await updateMutation.mutateAsync({ id: editingExpense.id, ...data });
      setEditingExpense(null);
      toast.success("Gasto actualizado", {
        description: "Los cambios se han guardado correctamente.",
      });
    } catch {
      toast.error("Error", {
        description: "No se pudo actualizar el gasto.",
      });
    }
  };

  const handleDelete = async (expense: Expense) => {
    if (confirm("¿Estás seguro de que deseas eliminar este gasto?")) {
      try {
        await deleteMutation.mutateAsync(expense.id);
        toast.success("Gasto eliminado", {
          description: "El registro se ha eliminado correctamente.",
        });
      } catch {
        toast.error("Error", {
          description: "No se pudo eliminar el gasto.",
        });
      }
    }
  };

  return (
    <div className="space-y-6 p-8 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-secondary to-secondary/60 bg-clip-text text-transparent">
            Gestión de Gastos
          </h1>
          <p className="text-muted-foreground mt-2">
            Control de compras, facturas y pagos a proveedores.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" /> Registrar Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl glass-card">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
              <DialogDescription>
                Ingresa los detalles de la factura o compra.
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm
              suppliers={suppliers}
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 glass"
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="glass">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Categoría" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="supplies">Suministros</SelectItem>
              <SelectItem value="equipment">Equipamiento</SelectItem>
              <SelectItem value="rent">Alquiler</SelectItem>
              <SelectItem value="utilities">Servicios</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="other">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ExpensesTable
        data={data?.data || []}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={data?.totalPages || 0}
        totalCount={data?.totalCount || 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onEdit={setEditingExpense}
        onDelete={handleDelete}
      />

      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent className="max-w-2xl glass-card">
          <DialogHeader>
            <DialogTitle>Editar Gasto</DialogTitle>
            <DialogDescription>
              Modifica los detalles del registro.
            </DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm
              suppliers={suppliers}
              defaultValues={{
                ...editingExpense,
                date: new Date(editingExpense.date),
                // Handle null to undefined/empty conversions for form compatibility
                invoice_number: editingExpense.invoice_number || undefined,
                notes: editingExpense.notes || undefined,
                supplier_id: editingExpense.supplier_id || "none", // Handle null supplier
              }}
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
