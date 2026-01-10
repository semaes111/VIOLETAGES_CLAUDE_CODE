"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";

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
import { PatientsTable } from "@/components/patients/PatientsTable";
import { PatientForm } from "@/components/patients/PatientForm";
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/hooks/usePatients";
import type { Patient, PatientInsert } from "@/types/database";
import { toast } from "sonner";

export default function PacientesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // const { toast } = useToast(); -> Removed
  
  const { data, isLoading } = usePatients({
    page,
    pageSize,
    search,
  });

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const handleCreate = async (data: PatientInsert) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateOpen(false);
      toast.success("Paciente creado", {
        description: "El paciente se ha registrado correctamente.",
      });
    } catch {
      toast.error("Error", {
        description: "No se pudo crear el paciente.",
      });
    }
  };

  const handleUpdate = async (data: PatientInsert) => {
    if (!editingPatient) return;
    try {
      await updateMutation.mutateAsync({
        id: editingPatient.id,
        data,
      });
      setEditingPatient(null);
      toast.success("Paciente actualizado", {
        description: "Los datos se han guardado correctamente.",
      });
    } catch {
      toast.error("Error", {
        description: "No se pudo actualizar el paciente.",
      });
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este paciente?")) return;
    
    try {
      await deleteMutation.mutateAsync(patient.id);
      toast.success("Paciente eliminado", {
        description: "El paciente ha sido eliminado correctamente.",
      });
    } catch {
      toast.error("Error", {
        description: "No se pudo eliminar el paciente.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Pacientes
          </h1>
          <p className="text-muted-foreground">
            Gestión de pacientes y expedientes
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="glass sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nuevo Paciente</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo paciente.
              </DialogDescription>
            </DialogHeader>
            <PatientForm
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            className="pl-9 glass"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <PatientsTable
        data={data?.data || []}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={data?.totalPages || 0}
        totalCount={data?.count || 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onEdit={setEditingPatient}
        onDelete={handleDelete}
      />

      <Dialog open={!!editingPatient} onOpenChange={(open) => !open && setEditingPatient(null)}>
        <DialogContent className="glass sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Modifica los datos del paciente.
            </DialogDescription>
          </DialogHeader>
          {editingPatient && (
            <PatientForm
              defaultValues={{
                ...editingPatient,
                email: editingPatient.email || "",
                phone: editingPatient.phone || "",
                notes: editingPatient.notes || "",
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
