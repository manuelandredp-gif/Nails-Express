// Base de datos PostgreSQL local para desarrollo (persistente en .pgdata-dev).
// Levanta un Postgres embebido en el puerto 55432. Dejar corriendo mientras se usa la web.
// Requiere (solo para desarrollo local, no para producción):
//   npm i --no-save embedded-postgres @embedded-postgres/windows-x64
import EmbeddedPostgres from "embedded-postgres";
import path from "path";
import fs from "fs";

const dir = path.join(process.cwd(), ".pgdata-dev");
const yaInicializada = fs.existsSync(path.join(dir, "PG_VERSION"));

const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "nails",
  password: "nailspass",
  port: 55432,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--no-locale"],
});

// Solo inicializar la primera vez; si el cluster ya existe, solo arrancar.
if (!yaInicializada) {
  await pg.initialise();
}
await pg.start();
try {
  await pg.createDatabase("nailsdb");
} catch (e) {
  /* ya existe */
}
console.log("PG_READY  ->  postgresql://nails:nailspass@127.0.0.1:55432/nailsdb");

process.stdin.resume();
const stop = async () => {
  try {
    await pg.stop();
  } catch (e) {}
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
