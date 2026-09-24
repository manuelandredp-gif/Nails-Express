export interface ServiceCategory {
  id: string;
  nombre: string;
}

export interface ServiceItem {
  id: string;
  nombre: string;
  slug: string;
  descripcionCorta: string;
  precio: number;
  duracionMinutos: number;
  imagenPrincipal: string;
  category?: ServiceCategory;
}

export interface StaffItem {
  id: string;
  nombre: string;
  color: string;
  activo: boolean;
}

export interface BookingState {
  step: 1 | 2 | 3 | 4;
  selectedService: ServiceItem | null;
  selectedDate: string; // YYYY-MM-DD
  selectedSlot: string | null; // ISO string
  selectedStaffId: string | null;
  nombre: string;
  celular: string;
  email: string;
  notasCliente: string;
  confirmedBooking: any | null;
  shiftFilter: "all" | "morning" | "afternoon";
}
