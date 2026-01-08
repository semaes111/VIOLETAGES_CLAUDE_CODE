"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionsTable } from "@/components/tables/TransactionsTable";
import { FilterPanel, type FilterValues } from "@/components/forms/FilterPanel";
import { useTransactions, useTransactionStats } from "@/hooks/useTransactions";

export default function IngresosPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [filters, setFilters] = React.useState<FilterValues>({
    types: [],
    paymentMethods: [],
  });

  const { data, isLoading, refetch } = useTransactions({
    ...filters,
    page,
    pageSize,
  });

  const { data: stats } = useTransactionStats(filters.dateFrom, filters.dateTo);

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Ingresos
          </h1>
          <p className="text-muted-foreground">
            Gestiona las transacciones de la clínica
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={() => router.push("/ingresos/nuevo")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva transacción
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalAmount ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.count ?? 0} transacciones
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.cashAmount ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarjeta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.cardAmount ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.transferAmount ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="pt-6">
          <TransactionsTable
            data={data?.data ?? []}
            isLoading={isLoading}
            page={page}
            pageSize={pageSize}
            totalPages={data?.totalPages ?? 1}
            totalCount={data?.count ?? 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onView={(transaction) =>
              router.push(`/ingresos/${transaction.id}`)
            }
            onEdit={(transaction) =>
              router.push(`/ingresos/${transaction.id}/editar`)
            }
            onDelete={(transaction) => {
              // TODO: Implement delete confirmation modal
              console.log("Delete:", transaction.id);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
