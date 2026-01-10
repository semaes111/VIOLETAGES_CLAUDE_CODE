"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useTreatments";
import type { Category } from "@/types/database";

// --- Form Schema ---
const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: z.enum(["medical", "aesthetic", "cosmetic"]),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// --- Component ---
export function CategoryList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: "medical",
      description: "",
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const payload = {
        ...values,
        description: values.description || null,
      };

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...payload });
        toast.success("Categoría actualizada");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Categoría creada");
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    } catch {
      toast.error("Error al guardar la categoría");
    }
  };

  const handleEdit = (item: Category) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      type: item.type,
      description: item.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Category) => {
    if (confirm(`¿Eliminar categoría "${item.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(item.id);
        toast.success("Categoría eliminada");
      } catch {
        toast.error("Error al eliminar");
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingItem(null);
      form.reset({
        name: "",
        type: "medical",
        description: "",
      });
    }
  };

  const typeLabels: Record<string, string> = {
    medical: "Médico",
    aesthetic: "Estético",
    cosmetic: "Cosmético",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
              <DialogDescription>
                Define un tipo de tratamiento para agrupar tu catálogo.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Facial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Breve descripción..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Guardar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={4} className="h-24 text-center">
                   <div className="flex items-center justify-center">
                     <Loader2 className="h-6 w-6 animate-spin text-primary" />
                   </div>
                 </TableCell>
               </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  No hay categorías registradas.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <motion.tr 
                  key={category.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{typeLabels[category.type] || category.type}</TableCell>
                  <TableCell className="text-muted-foreground">{category.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(category)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
