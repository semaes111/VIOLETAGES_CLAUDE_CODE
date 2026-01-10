import { Metadata } from 'next';
import { AppointmentsCalendar } from '@/components/appointments/AppointmentsCalendar';

export const metadata: Metadata = {
  title: 'Agendamiento | VioletaGest',
  description: 'Gestión de citas y calendario',
};

export default function AgendamientoPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AppointmentsCalendar />
    </div>
  );
}
