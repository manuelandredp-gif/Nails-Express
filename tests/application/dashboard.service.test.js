const { test, describe } = require("node:test");
const assert = require("node:assert");

function calculateOccupancy(bookedToday, staffCount, slotsPerStaff = 9) {
  const totalSlotsCapacity = Math.max(1, staffCount * slotsPerStaff);
  const occupancyPercent = Math.min(100, Math.round((bookedToday / totalSlotsCapacity) * 100));
  return { totalSlotsCapacity, occupancyPercent };
}

describe("Application: DashboardService Occupancy Metrics", () => {
  test("debe calcular correctamente la capacidad total del salón según staff activo", () => {
    const { totalSlotsCapacity, occupancyPercent } = calculateOccupancy(9, 2);
    assert.strictEqual(totalSlotsCapacity, 18);
    assert.strictEqual(occupancyPercent, 50);
  });

  test("no debe permitir porcentajes mayores al 100% ante sobreocupación", () => {
    const { occupancyPercent } = calculateOccupancy(25, 2);
    assert.strictEqual(occupancyPercent, 100);
  });

  test("debe manejar staff cero sin división por cero", () => {
    const { totalSlotsCapacity, occupancyPercent } = calculateOccupancy(0, 0);
    assert.strictEqual(totalSlotsCapacity, 1);
    assert.strictEqual(occupancyPercent, 0);
  });
});
