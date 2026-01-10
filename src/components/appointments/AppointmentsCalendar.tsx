"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentWithPatient } from "@/types/database";
import { AppointmentForm } from "./AppointmentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import "./calendar-styles.css"; // Custom styles for glassmorphism

const locales = {
  "es": es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: AppointmentWithPatient;
};

export function AppointmentsCalendar() {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  
  // Fetch appointments for the current view roughly
  // Ideally filtering by month, but fetching all for simplicity now suitable for MVP
  const { data: appointments } = useAppointments();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithPatient | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const events: CalendarEvent[] = appointments?.map(apt => ({
    id: apt.id,
    title: `${apt.patient?.name || "Sin Nombre"} (${apt.status})`,
    start: new Date(apt.start_time),
    end: new Date(apt.end_time),
    resource: apt,
  })) || [];

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedAppointment(undefined);
    setSelectedDate(start);
    setIsDialogOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedAppointment(event.resource);
    setSelectedDate(undefined);
    setIsDialogOpen(true);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3b82f6"; // blue-500 default (scheduled)
    const status = event.resource.status;
    
    if (status === "confirmed") backgroundColor = "#10b981"; // emerald-500
    if (status === "completed") backgroundColor = "#6366f1"; // indigo-500
    if (status === "cancelled") backgroundColor = "#ef4444"; // red-500
    if (status === "no_show") backgroundColor = "#f59e0b"; // amber-500

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  return (
    <div className="h-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Agenda</h2>
        <Button onClick={() => { setSelectedAppointment(undefined); setSelectedDate(new Date()); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      <Card className="p-4 h-[calc(100vh-12rem)] bg-white/40 backdrop-blur-xl border-white/20 shadow-xl dark:bg-black/40">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          culture="es"
          eventPropGetter={eventStyleGetter}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay citas en este rango.",
          }}
          className="glass-calendar"
        />
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedAppointment ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
          </DialogHeader>
          <AppointmentForm 
            initialData={selectedAppointment} 
            defaultDate={selectedDate}
            onSuccess={() => setIsDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
