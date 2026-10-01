import { Prisma } from "@prisma/client";

/**
 * Deriva la lista de campos editables de Settings DIRECTAMENTE del esquema de
 * Prisma (DMMF), en vez de mantener una whitelist escrita a mano. Antes, agregar
 * un campo editable exigía tocar 3 lugares y olvidar la whitelist hacía que el
 * campo "se guardara" en el formulario pero nunca llegara a la BD (bug silencioso).
 * Ahora basta con agregar el campo al schema.
 */
const EXCLUIDOS = new Set(["id", "createdAt", "updatedAt"]);

const model = Prisma.dmmf.datamodel.models.find((m) => m.name === "Settings");

function camposPorTipo(tipo: "String" | "Int" | "Boolean"): string[] {
  if (!model) return [];
  return model.fields
    .filter(
      (f) =>
        f.kind === "scalar" &&
        f.type === tipo &&
        !EXCLUIDOS.has(f.name) &&
        !f.isReadOnly
    )
    .map((f) => f.name);
}

export const SETTINGS_STRING_FIELDS = camposPorTipo("String");
export const SETTINGS_INT_FIELDS = camposPorTipo("Int");
export const SETTINGS_BOOL_FIELDS = camposPorTipo("Boolean");
