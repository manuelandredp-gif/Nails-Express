import { Appointment, Customer, Service, Staff, TimeBlock, Settings } from "@prisma/client";

export interface IAppointmentRepository {
  findConflicting(
    staffIds: string[],
    startAt: Date,
    endAt: Date,
    excludeAppointmentId?: string
  ): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  findByCode(code: string): Promise<Appointment | null>;
  create(data: any): Promise<Appointment>;
  update(id: string, data: any): Promise<Appointment>;
  countByStaffAndDateRange(staffId: string, start: Date, end: Date): Promise<number>;
  findTodayAppointments(startOfDay: Date, endOfDay: Date): Promise<any[]>;
  countInRange(start: Date, end: Date): Promise<number>;
  findRevenueInRange(start: Date, end: Date): Promise<{ precio: number; startAt: Date }[]>;
  countByStatus(status: string): Promise<number>;
}

export interface ICustomerRepository {
  findByPhone(phone: string): Promise<Customer | null>;
  create(data: any): Promise<Customer>;
  update(id: string, data: any): Promise<Customer>;
}

export interface IServiceRepository {
  findById(id: string): Promise<any | null>;
  findBySlug(slug: string): Promise<any | null>;
  findActive(): Promise<Service[]>;
  findTopServices(limit: number): Promise<any[]>;
}

export interface IStaffRepository {
  findActive(): Promise<Staff[]>;
  findById(id: string): Promise<Staff | null>;
}
