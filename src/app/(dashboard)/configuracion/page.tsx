"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryList } from "@/components/configuration/CategoryList";
import { SupplierList } from "@/components/configuration/SupplierList";
import { ProductList } from "@/components/configuration/ProductList";
import { Layers, Truck, Package } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6 p-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">
          Configuración
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestión de catálogos y referencias del sistema.
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="glass p-1">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Proveedores
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Productos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="glass-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium">Categorías de Tratamientos</h2>
            <p className="text-sm text-muted-foreground">
              Define los tipos de servicios que ofrece la clínica.
            </p>
          </div>
          <CategoryList />
        </TabsContent>

        <TabsContent value="suppliers" className="glass-card p-6">
           <div className="mb-6">
            <h2 className="text-lg font-medium">Proveedores</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona tu lista de proveedores habituales.
            </p>
          </div>
          <SupplierList />
        </TabsContent>

        <TabsContent value="products" className="glass-card p-6">
           <div className="mb-6">
            <h2 className="text-lg font-medium">Inventario de Productos</h2>
             <p className="text-sm text-muted-foreground">
              Control de stock y material fungible.
            </p>
          </div>
          <ProductList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
