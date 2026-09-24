import { prisma } from "@/lib/db";
import {
  IAppointmentRepository,
  ICustomerRepository,
  IServiceRepository,
  IStaffRepository,
} from "@/lib/domain/repositories";
import { Appointment, Customer, Service, Staff } from "@prisma/client";

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async findConflicting(
    staffIds: string[],
    startAt: Date,
    endAt: Date,
    excludeAppointmentId?: string
  ): Promise<Appointment[]> {
    return prisma.appointment.findMany({
      where: {
        staffId: { in: staffIds },
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      },
      include: {
        customer: true,
        service: true,
        staff: true,
      },
    });
  }

  async findById(id: string): Promise<Appointment | null> {
    return prisma.appointment.findUnique({
      where: { id },
      include: { customer: true, service: true, staff: true, logs: true },
    });
  }

  async findByCode(code: string): Promise<Appointment | null> {
    return prisma.appointment.findUnique({
      where: { codigo: code },
      include: { customer: true, service: true, staff: true, logs: true },
    });
  }

  async create(data: any): Promise<Appointment> {
    return prisma.appointment.create({ data, include: { customer: true, service: true, staff: true } });
  }

  async update(id: string, data: any): Promise<Appointment> {
    return prisma.appointment.update({ where: { id }, data, include: { customer: true, service: true, staff: true } });
  }

  async countByStaffAndDateRange(staffId: string, start: Date, end: Date): Promise<number> {
    return prisma.appointment.count({
      where: {
        staffId,
        startAt: { gte: start, lte: end },
        estado: { in: ["PENDIENTE", "CONFIRMADA", "COMPLETADA"] },
      },
    });
  }

  async findTodayAppointments(startOfDay: Date, endOfDay: Date): Promise<any[]> {
    return prisma.appointment.findMany({
      where: {
        startAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        customer: true,
        service: true,
        staff: true,
      },
      orderBy: { startAt: "asc" },
    });
  }

  async countInRange(start: Date, end: Date): Promise<number> {
    return prisma.appointment.count({
      where: {
        startAt: { gte: start, lte: end },
      },
    });
  }

  async findRevenueInRange(start: Date, end: Date): Promise<{ precio: number; startAt: Date }[]> {
    return prisma.appointment.findMany({
      where: {
        startAt: { gte: start, lte: end },
        estado: { in: ["CONFIRMADA", "COMPLETADA"] },
      },
      select: { precio: true, startAt: true },
    });
  }

  async countByStatus(status: string): Promise<number> {
    return prisma.appointment.count({ where: { estado: status } });
  }
}

export class PrismaCustomerRepository implements ICustomerRepository {
  async findByPhone(phone: string): Promise<Customer | null> {
    return prisma.customer.findUnique({ where: { celular: phone } });
  }

  async create(data: any): Promise<Customer> {
    return prisma.customer.create({ data });
  }

  async update(id: string, data: any): Promise<Customer> {
    return prisma.customer.update({ where: { id }, data });
  }
}

export class PrismaServiceRepository implements IServiceRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.service.findUnique({
      where: { id },
      include: {
        staff: {
          where: { staff: { activo: true } },
          include: { staff: true },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<any | null> {
    return prisma.service.findUnique({
      where: { slug },
      include: { category: true },
    });
  }

  async findActive(): Promise<Service[]> {
    return prisma.service.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
    });
  }

  async findTopServices(limit: number): Promise<any[]> {
    return prisma.service.findMany({
      include: {
        _count: { select: { citas: true } },
      },
      orderBy: { citas: { _count: "desc" } },
      take: limit,
    });
  }
}

export class PrismaStaffRepository implements IStaffRepository {
  async findActive(): Promise<Staff[]> {
    return prisma.staff.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
    });
  }

  async findById(id: string): Promise<Staff | null> {
    return prisma.staff.findUnique({ where: { id } });
  }
}
