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
import { TreatmentsTable } from "@/components/treatments/TreatmentsTable";
import { TreatmentForm } from "@/components/treatments/TreatmentForm";
import {
  useTreatments,
  useCategories,
  useCreateTreatment,
  useUpdateTreatment,
  useDeleteTreatment,
} from "@/hooks/useTreatments";
import type { Treatment, TreatmentInsert } from "@/types/database";

export default function TratamientosPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);

  const { data: categories = [] } = useCategories();
  
  const { data, isLoading } = useTreatments({
    page,
    pageSize,
    search,
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const createMutation = useCreateTreatment();
  const updateMutation = useUpdateTreatment();
  const deleteMutation = useDeleteTreatment();

  const handleCreate = async (data: TreatmentInsert) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateOpen(false);
      toast.success("Tratamiento creado", {
        description: "El tratamiento se ha registrado correctamente.",
      });
    } catch {
      toast.error("Error", {
        description: "No se pudo crear el tratamiento.",
      });
    }
  };

  const handleUpdate = async (data: TreatmentInsert) => {
    if (!editingTreatment) return;
    
    try {
      await updateMutation.mutateAsync({ id: editingTreatment.id, ...data });
      setEditingTreatment(null);
      toast.success("Tratamiento actualizado", {
        description: "Los cambios se han guardado correctamente.",
      });
    } catch {
      toast.error("Error", {
        description: "No se pudo actualizar el tratamiento.",
      });
    }
  };

  const handleDelete = async (treatment: Treatment) => {
    if (confirm("¿Estás seguro de que deseas eliminar este tratamiento?")) {
      try {
        await deleteMutation.mutateAsync(treatment.id);
        toast.success("Tratamiento eliminado", {
          description: "El tratamiento se ha eliminado correctamente.",
        });
      } catch {
        toast.error("Error", {
          description: "No se pudo eliminar el tratamiento.",
        });
      }
    }
  };

  return (
    <div className="space-y-6 p-8 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Tratamientos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona el catálogo de servicios y precios.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Tratamiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl glass-card">
            <DialogHeader>
              <DialogTitle>Nuevo Tratamiento</DialogTitle>
              <DialogDescription>
                Añade un nuevo servicio al catálogo.
              </DialogDescription>
            </DialogHeader>
            <TreatmentForm
              categories={categories}
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
            placeholder="Buscar tratamientos..."
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
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TreatmentsTable
        data={data?.data || []}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={data?.totalPages || 0}
        totalCount={data?.totalCount || 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onEdit={setEditingTreatment}
        onDelete={handleDelete}
      />

      <Dialog open={!!editingTreatment} onOpenChange={(open) => !open && setEditingTreatment(null)}>
        <DialogContent className="max-w-2xl glass-card">
          <DialogHeader>
            <DialogTitle>Editar Tratamiento</DialogTitle>
            <DialogDescription>
              Modifica los detalles del tratamiento.
            </DialogDescription>
          </DialogHeader>
          {editingTreatment && (
            <TreatmentForm
              categories={categories}
              defaultValues={{
                ...editingTreatment,
                description: editingTreatment.description || undefined,
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
