// Se ejecuta una vez al iniciar cada instancia del servidor (incluido Vercel).
// Fija la zona horaria del salón para que todas las fechas del servidor usen
// America/Lima, incluso en hosts que corren en UTC y no permiten la variable TZ.
export function register() {
  if (!process.env.TZ) {
    process.env.TZ = "America/Lima";
  }
}
