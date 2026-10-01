const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const { PrismaClient } = require("@prisma/client");
const { addMinutes } = require("date-fns");

/**
 * Test de integración de disponibilidad y concurrencia. CREA SUS PROPIOS DATOS
 * (no depende del seed), por eso corre en una base de datos vacía en CI. Limpia
 * todo lo que crea al terminar.
 */
const prisma = new PrismaClient();
const SUFIJO = `test-${Date.now()}`;
let categoria, service, staff;

before(async () => {
  categoria = await prisma.serviceCategory.create({
    data: { nombre: `Cat ${SUFIJO}`, slug: `cat-${SUFIJO}` },
  });
  service = await prisma.service.create({
    data: {
      slug: `svc-${SUFIJO}`,
      nombre: "Servicio de prueba",
      categoryId: categoria.id,
      descripcionCorta: "x",
      descripcionLarga: "x",
      precio: 39,
      duracionMinutos: 60,
      bufferMinutos: 15,
      imagenPrincipal: "x",
      caracteristicas: "[]",
      coloresPopulares: "[]",
    },
  });
  staff = await prisma.staff.create({
    data: { nombre: `Staff ${SUFIJO}`, foto: "x" },
  });
});

after(async () => {
  await prisma.appointment.deleteMany({ where: { serviceId: service?.id } });
  await prisma.customer.deleteMany({ where: { celular: `+51${SUFIJO.replace(/\D/g, "").slice(-9) || "900000000"}` } });
  if (staff) await prisma.staff.delete({ where: { id: staff.id } }).catch(() => {});
  if (service) await prisma.service.delete({ where: { id: service.id } }).catch(() => {});
  if (categoria) await prisma.serviceCategory.delete({ where: { id: categoria.id } }).catch(() => {});
  await prisma.$disconnect();
});

function intervalsOverlap(aS, aE, bS, bE) {
  return aS.getTime() < bE.getTime() && aE.getTime() > bS.getTime();
}

describe("Integración: disponibilidad y concurrencia", () => {
  test("intervalos cruzados se detectan como solapados; contiguos no", () => {
    const a = [new Date("2026-04-10T10:00:00Z"), new Date("2026-04-10T11:00:00Z")];
    const b = [new Date("2026-04-10T10:30:00Z"), new Date("2026-04-10T11:30:00Z")];
    const c = [new Date("2026-04-10T11:00:00Z"), new Date("2026-04-10T12:00:00Z")];
    assert.strictEqual(intervalsOverlap(a[0], a[1], b[0], b[1]), true);
    assert.strictEqual(intervalsOverlap(a[0], a[1], c[0], c[1]), false);
  });

  test("una cita CANCELADA libera el horario", async () => {
    const customer = await prisma.customer.create({
      data: { nombre: "Tester", celular: `+519${Date.now().toString().slice(-8)}` },
    });
    const start = new Date("2026-05-15T15:00:00Z");
    const end = addMinutes(start, service.duracionMinutos + service.bufferMinutos);

    const cancelada = await prisma.appointment.create({
      data: {
        codigo: `NX-C-${SUFIJO}`.slice(0, 20),
        customerId: customer.id,
        serviceId: service.id,
        staffId: staff.id,
        startAt: start,
        endAt: end,
        precio: 39,
        estado: "CANCELADA",
        origen: "WEB",
      },
    });

    const conflictos = await prisma.appointment.findMany({
      where: {
        staffId: staff.id,
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
        startAt: { lt: end },
        endAt: { gt: start },
      },
    });
    assert.strictEqual(conflictos.length, 0);

    await prisma.appointment.delete({ where: { id: cancelada.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
  });

  test("dos reservas simultáneas para el mismo slot: solo una gana", async () => {
    const customer = await prisma.customer.create({
      data: { nombre: "Tester2", celular: `+519${(Date.now() + 1).toString().slice(-8)}` },
    });
    const start = new Date("2026-05-20T11:00:00Z");
    const end = addMinutes(start, service.duracionMinutos + service.bufferMinutos);

    async function reservar(n) {
      return prisma.$transaction(async (tx) => {
        const conflict = await tx.appointment.findFirst({
          where: {
            staffId: staff.id,
            estado: { in: ["PENDIENTE", "CONFIRMADA"] },
            startAt: { lt: end },
            endAt: { gt: start },
          },
        });
        if (conflict) throw new Error("SLOT_OCCUPIED");
        return tx.appointment.create({
          data: {
            codigo: `NX-K${n}-${SUFIJO}`.slice(0, 20),
            customerId: customer.id,
            serviceId: service.id,
            staffId: staff.id,
            startAt: start,
            endAt: end,
            precio: 39,
            estado: "CONFIRMADA",
            origen: "WEB",
          },
        });
      });
    }

    const results = await Promise.allSettled([reservar(1), reservar(2)]);
    const ok = results.filter((r) => r.status === "fulfilled");
    const fail = results.filter((r) => r.status === "rejected");
    assert.strictEqual(ok.length, 1);
    assert.strictEqual(fail.length, 1);

    await prisma.appointment.deleteMany({ where: { customerId: customer.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
  });
});
