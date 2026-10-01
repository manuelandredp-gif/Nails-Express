# ADR 003 — Dinero y tipos de dominio

**Estado:** Aceptado · 2026-10-01

## Contexto
La auditoría señaló "obsesión por primitivos": dinero como `Float`, rol y estado
como `String` libres, celular como `String` con la normalización enterrada en un
servicio. Riesgos: un typo de rol/estado compila y entra a la BD; los céntimos de
la caja pueden desviarse al acumular muchos cobros.

## Decisión
- **Dinero:** se mantiene `Float` en la BD (migrar a `Decimal` tocaba ~30 archivos
  con riesgo real sobre la caja en producción). El riesgo de acumulación se elimina
  con `lib/domain/money.ts`: toda suma de caja pasa por `sumarDinero`, que redondea
  a céntimos en cada paso. Cubierto por tests unitarios (`0.1 + 0.2 === 0.3`).
- **Roles / estados / métodos de pago:** centralizados como uniones `as const` en
  `lib/domain/constants.ts` y validados con `zod` en la frontera. Un valor inválido
  ya no compila ni se acepta por la API. No se migró la columna a `enum` de Postgres
  para no arriesgar los datos en vivo; la seguridad se gana en el borde (código + API).
- **Celular:** `normalizarCelular` en `lib/domain/phone.ts` es la única fuente; el
  servicio de reservas y el alta de clientas la reutilizan.

## Consecuencias
- Seguridad de tipos donde los errores realmente entran (código y cuerpos de API).
- La caja cuadra al céntimo sin una migración peligrosa.
- Si el volumen o la contabilidad lo exigen, migrar a `Decimal` queda como trabajo
  futuro acotado (el formato de dinero ya está centralizado en un solo módulo).
