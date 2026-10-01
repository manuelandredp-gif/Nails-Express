/**
 * Normalización de celulares a formato E.164 de Perú (+51). Fuente única:
 * cualquier lugar que guarde o compare un celular debe pasar por aquí para que
 * "+51 952 123 456", "952123456" y "51952123456" terminen siendo el mismo valor.
 */
export function normalizarCelular(phone: string): string {
  const cleaned = (phone || "").replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+51")) return cleaned;
  if (cleaned.startsWith("51") && cleaned.length >= 11) return `+${cleaned}`;
  if (cleaned.length === 9) return `+51${cleaned}`;
  return cleaned;
}
