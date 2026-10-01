// Base de datos PostgreSQL local para desarrollo (persistente en .pgdata-dev).
// Levanta un Postgres embebido en el puerto 55432. Dejar corriendo mientras se usa la web.
import EmbeddedPostgres from "embedded-postgres";
import path from "path";
const pg = new EmbeddedPostgres({
  databaseDir: path.join(process.cwd(), ".pgdata-dev"),
  user: "nails", password: "nailspass", port: 55432, persistent: true,
  initdbFlags: ["--encoding=UTF8", "--no-locale"],
});
await pg.initialise();
await pg.start();
try { await pg.createDatabase("nailsdb"); } catch (e) {}
console.log("PG_READY  ->  postgresql://nails:nailspass@127.0.0.1:55432/nailsdb");
process.stdin.resume();
const stop = async () => { try { await pg.stop(); } catch (e) {} process.exit(0); };
process.on("SIGTERM", stop); process.on("SIGINT", stop);
