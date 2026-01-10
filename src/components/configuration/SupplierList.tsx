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
import { Switch } from "@/components/ui/switch";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "@/hooks/useExpenses";
import type { Supplier } from "@/types/database";

// --- Form Schema ---
const supplierSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  contact_name: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean().default(true),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export function SupplierList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading } = useSuppliers();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      is_active: true,
    },
  });

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      const payload = {
        ...values,
        contact_name: values.contact_name || null,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
      };

      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...payload });
        toast.success("Proveedor actualizado");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Proveedor creado");
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    } catch {
      toast.error("Error al guardar el proveedor");
    }
  };

  const handleEdit = (item: Supplier) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      contact_name: item.contact_name || "",
      email: item.email || "",
      phone: item.phone || "",
      address: item.address || "",
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Supplier) => {
    if (confirm(`¿Eliminar proveedor "${item.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(item.id);
        toast.success("Proveedor eliminado");
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
        contact_name: "",
        email: "",
        phone: "",
        address: "",
        is_active: true,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl glass-card">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
              <DialogDescription>
                Gestiona la información de tus proveedores.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Comercial</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Laboratorios X" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 600 000 000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Persona de Contacto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contacto@proveedor.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="Dirección completa..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Activo</FormLabel>
                        <DialogDescription>
                          El proveedor aparecerá en las listas de selección.
                        </DialogDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
              <TableHead>Contacto</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={5} className="h-24 text-center">
                   <div className="flex items-center justify-center">
                     <Loader2 className="h-6 w-6 animate-spin text-primary" />
                   </div>
                 </TableCell>
               </TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  No hay proveedores registrados.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <motion.tr 
                  key={supplier.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-muted/30"
                >
                  <TableCell>
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-xs text-muted-foreground">{supplier.address}</div>
                  </TableCell>
                  <TableCell>{supplier.contact_name || "-"}</TableCell>
                  <TableCell>{supplier.email || "-"}</TableCell>
                  <TableCell className="text-center">
                    {supplier.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        Inactivo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(supplier)}>
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
