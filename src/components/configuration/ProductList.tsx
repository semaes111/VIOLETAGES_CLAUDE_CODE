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
import { Switch } from "@/components/ui/switch";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useExpenses";
import type { Product } from "@/types/database";

// --- Form Schema ---
// Schema: name, supplier_id, cost_price, sale_price, margin_pct, stock, min_stock, is_active
const productSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  supplier_id: z.string().min(1, "El proveedor es requerido"),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
  min_stock: z.coerce.number().min(0, "El stock mínimo no puede ser negativo"),
  cost_price: z.coerce.number().min(0),
  sale_price: z.coerce.number().min(0),
  margin_pct: z.coerce.number().min(0),
  is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      supplier_id: "",
      stock: 0,
      min_stock: 5,
      cost_price: 0,
      sale_price: 0,
      margin_pct: 0,
      is_active: true,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, ...values });
        toast.success("Producto actualizado");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Producto creado");
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    } catch {
      toast.error("Error al guardar el producto");
    }
  };

  const handleEdit = (item: Product) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      supplier_id: item.supplier_id,
      stock: item.stock,
      min_stock: item.min_stock,
      cost_price: item.cost_price,
      sale_price: item.sale_price,
      margin_pct: item.margin_pct,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Product) => {
    if (confirm(`¿Eliminar producto "${item.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(item.id);
        toast.success("Producto eliminado");
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
        supplier_id: "",
        stock: 0,
        min_stock: 5,
        cost_price: 0,
        sale_price: 0,
        margin_pct: 0,
        is_active: true,
      });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl glass-card">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              <DialogDescription>
                Gestiona el inventario de productos.
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
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Gel de limpieza" {...field} />
                        </FormControl>
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
                          defaultValue={field.value}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un proveedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cost_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>P. Coste (€)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="margin_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Margen (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>P. Venta (€)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Actual</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="min_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Mínimo</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
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
                          El producto está disponible en inventario.
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
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">P. Venta</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingProducts ? (
               <TableRow>
                 <TableCell colSpan={5} className="h-24 text-center">
                   <div className="flex items-center justify-center">
                     <Loader2 className="h-6 w-6 animate-spin text-primary" />
                   </div>
                 </TableCell>
               </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  No hay productos registrados.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <motion.tr 
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-muted/30"
                >
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    {!product.is_active && <span className="text-xs text-muted-foreground">(Inactivo)</span>}
                  </TableCell>
                  <TableCell>
                    {product.supplier?.name || "Sin proveedor"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.sale_price)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={product.stock <= product.min_stock ? "text-red-500 font-bold" : "text-emerald-500 font-bold"}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product)}>
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
