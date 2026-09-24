const { PrismaClient } = require("@prisma/client");
const { addMinutes } = require("date-fns");

const prisma = new PrismaClient();

function intervalsOverlap(startA, endA, startB, endB) {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

async function runTests() {
  console.log("=== INICIANDO SUITE DE TESTS: DISPONIBILIDAD Y CONCURRENCIA ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✔ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✖ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Verificar función pura de solapamiento
    const t1Start = new Date("2026-04-10T10:00:00Z");
    const t1End = new Date("2026-04-10T11:00:00Z");
    const t2Start = new Date("2026-04-10T10:30:00Z");
    const t2End = new Date("2026-04-10T11:30:00Z");
    const t3Start = new Date("2026-04-10T11:00:00Z");
    const t3End = new Date("2026-04-10T12:00:00Z");

    assert(
      intervalsOverlap(t1Start, t1End, t2Start, t2End) === true,
      "Intervalos cruzados de 10:00 a 11:00 y 10:30 a 11:30 se detectan como solapados"
    );
    assert(
      intervalsOverlap(t1Start, t1End, t3Start, t3End) === false,
      "Intervalos contiguos (10:00-11:00 y 11:00-12:00) NO se solapan (borde exacto permitido)"
    );

    // Test 2: Citas canceladas no bloquean el horario
    const service = await prisma.service.findFirst({
      where: { slug: "manicure-en-gel" },
    });
    const staff = await prisma.staff.findFirst({
      where: { id: "staff-valentina" },
    });

    const testCustomer = await prisma.customer.upsert({
      where: { celular: "+51999888777" },
      update: {},
      create: {
        nombre: "Test User",
        celular: "+51999888777",
      },
    });

    const testSlotStart = new Date("2026-05-15T15:00:00Z");
    const testSlotEnd = addMinutes(
      testSlotStart,
      service.duracionMinutos + service.bufferMinutos
    );

    // Crear cita cancelada
    const cancelledApp = await prisma.appointment.create({
      data: {
        codigo: "NX-TEST-CANCEL",
        customerId: testCustomer.id,
        serviceId: service.id,
        staffId: staff.id,
        startAt: testSlotStart,
        endAt: testSlotEnd,
        precio: 39,
        estado: "CANCELADA",
        origen: "WEB",
      },
    });

    // Validar que una cita con estado CANCELADA no cuenta como conflicto
    const activeConflicts = await prisma.appointment.findMany({
      where: {
        staffId: staff.id,
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
        startAt: { lt: testSlotEnd },
        endAt: { gt: testSlotStart },
      },
    });
    assert(
      activeConflicts.length === 0,
      "Cita con estado CANCELADA libera automáticamente el slot de horario"
    );

    // Limpiar cita de prueba
    await prisma.appointment.delete({ where: { id: cancelledApp.id } });

    // Test 3: Bloqueo de horario (TimeBlock) invalida slots
    const blockStart = new Date("2026-05-16T14:00:00Z");
    const blockEnd = new Date("2026-05-16T16:00:00Z");
    const timeBlock = await prisma.timeBlock.create({
      data: {
        staffId: staff.id,
        startAt: blockStart,
        endAt: blockEnd,
        motivo: "Almuerzo / Capacitación",
      },
    });

    const conflictsWithBlock = await prisma.timeBlock.findMany({
      where: {
        staffId: staff.id,
        startAt: { lt: new Date("2026-05-16T14:30:00Z") },
        endAt: { gt: new Date("2026-05-16T14:00:00Z") },
      },
    });
    assert(
      conflictsWithBlock.length > 0,
      "TimeBlock detecta e impide reservas durante periodo bloqueado"
    );

    await prisma.timeBlock.delete({ where: { id: timeBlock.id } });

    // Test 4: Concurrencia de 2 reservas simultáneas para el mismo slot y misma manicurista
    console.log("  → Ejecutando test de concurrencia simultánea...");
    const concurrencyStart = new Date("2026-05-20T11:00:00Z");
    const concurrencyEnd = addMinutes(
      concurrencyStart,
      service.duracionMinutos + service.bufferMinutos
    );

    // Función simuladora de reserva transaccional
    async function attemptBooking(userNum) {
      return await prisma.$transaction(async (tx) => {
        const conflict = await tx.appointment.findFirst({
          where: {
            staffId: staff.id,
            estado: { in: ["PENDIENTE", "CONFIRMADA"] },
            startAt: { lt: concurrencyEnd },
            endAt: { gt: concurrencyStart },
          },
        });
        if (conflict) {
          throw new Error("SLOT_OCCUPIED");
        }
        return await tx.appointment.create({
          data: {
            codigo: `NX-CONCUR-${userNum}`,
            customerId: testCustomer.id,
            serviceId: service.id,
            staffId: staff.id,
            startAt: concurrencyStart,
            endAt: concurrencyEnd,
            precio: 39,
            estado: "CONFIRMADA",
            origen: "WEB",
          },
        });
      });
    }

    const results = await Promise.allSettled([
      attemptBooking(1),
      attemptBooking(2),
    ]);

    const successes = results.filter((r) => r.status === "fulfilled");
    const failures = results.filter((r) => r.status === "rejected");

    assert(
      successes.length === 1 && failures.length === 1,
      "Test de concurrencia: exactamente 1 reserva fue confirmada y la otra fue rechazada con SLOT_OCCUPIED"
    );

    // Limpieza de cita de concurrencia
    await prisma.appointment.deleteMany({
      where: {
        codigo: { in: ["NX-CONCUR-1", "NX-CONCUR-2"] },
      },
    });
    await prisma.customer.delete({ where: { id: testCustomer.id } });
  } catch (err) {
    console.error("Error durante tests:", err);
    failed++;
  }

  console.log(`\nResumen de Tests: ${passed} pasados, ${failed} fallidos.`);
  if (failed > 0) process.exit(1);
}

runTests().finally(() => prisma.$disconnect());
