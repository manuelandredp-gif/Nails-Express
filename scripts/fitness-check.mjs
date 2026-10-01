/**
 * Fitness functions: reglas de arquitectura que se verifican en CI. Si alguna
 * regla dura se viola, el build falla — así la arquitectura no se degrada
 * silenciosamente con el tiempo. Sin dependencias externas (solo Node).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
let errores = 0;
let avisos = 0;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if ([".ts", ".tsx"].includes(extname(name))) out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const read = (f) => readFileSync(f, "utf8");
const rel = (f) => f.slice(ROOT.length + 1).replace(/\\/g, "/");

function fail(msg) {
  console.error(`  ✖ ${msg}`);
  errores++;
}
function warn(msg) {
  console.warn(`  ⚠ ${msg}`);
  avisos++;
}

// ── FF-01: Ninguna ruta admin usa getAdminSession directo (debe usar withRole) ──
console.log("FF-01 · Permisos centralizados en las rutas admin");
for (const f of files) {
  const r = rel(f);
  if (!r.startsWith("app/api/admin/")) continue;
  if (r.includes("/login/") || r.includes("/logout/")) continue;
  if (read(f).includes("getAdminSession")) {
    fail(`${r} usa getAdminSession directo; debe usar withRole/withManager/withSession.`);
  }
}

// ── FF-02: Pureza del dominio (los tipos de negocio no dependen de framework/BD) ──
console.log("FF-02 · Pureza de lib/domain (constants, money, phone)");
const PUROS = ["lib/domain/constants.ts", "lib/domain/money.ts", "lib/domain/phone.ts"];
const PROHIBIDO_DOMINIO = ["next/", "@prisma/client", "@/lib/db", "lib/infrastructure", "lib/application"];
for (const f of files) {
  const r = rel(f);
  if (!PUROS.includes(r)) continue;
  const src = read(f);
  for (const bad of PROHIBIDO_DOMINIO) {
    if (src.includes(`from "${bad}`) || src.includes(`from '${bad}`)) {
      fail(`${r} importa "${bad}"; el dominio puro no debe depender de infraestructura.`);
    }
  }
}

// ── FF-03: Los componentes no acceden a la base de datos directamente ──
console.log("FF-03 · Los componentes no importan la base de datos");
for (const f of files) {
  const r = rel(f);
  if (!r.startsWith("components/")) continue;
  const src = read(f);
  if (src.includes('from "@/lib/db"') || src.includes('from "@prisma/client"')) {
    fail(`${r} importa la BD; los componentes deben usar la API (fetch), no Prisma.`);
  }
}

// ── FF-04 (aviso): componentes demasiado grandes (deuda de mantenibilidad) ──
console.log("FF-04 · Tamaño de componentes (aviso)");
for (const f of files) {
  const r = rel(f);
  if (!r.startsWith("components/")) continue;
  const lineas = read(f).split("\n").length;
  if (lineas > 500) warn(`${r} tiene ${lineas} líneas (meta: < 500). Conviene dividirlo.`);
}

console.log("");
if (errores > 0) {
  console.error(`✖ Fitness functions: ${errores} violación(es), ${avisos} aviso(s).`);
  process.exit(1);
}
console.log(`✓ Fitness functions OK (${avisos} aviso(s) de tamaño).`);
