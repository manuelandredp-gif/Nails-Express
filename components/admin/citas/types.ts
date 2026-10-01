export interface AppointmentItem {
  id: string;
  codigo: string;
  startAt: string;
  endAt: string;
  precio: number;
  estado: string;
  origen: string;
  notasCliente?: string | null;
  pagado?: boolean;
  metodoPago?: string | null;
  resenaEstrellas?: number | null;
  resenaTexto?: string | null;
  customer: { nombre: string; celular: string };
  service: { nombre: string };
  staff: { nombre: string; color: string };
}
