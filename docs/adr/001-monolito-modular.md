# ADR 001 — Monolito modular ligero (no Clean Architecture completa)

**Estado:** Aceptado · 2026-10-01

## Contexto
La auditoría forense recomendó una arquitectura objetivo. El protocolo "de libro"
proponía Clean Architecture de 4 capas con cobertura del 90 % en dominio
(45–60 días de trabajo). El sistema lo mantiene una dueña de negocio no técnica
asistida por IA, no un equipo de desarrollo.

## Decisión
Adoptar un **monolito modular ligero** sobre la estructura de Next.js existente:
- `lib/domain/` — conceptos puros del negocio (constantes, dinero, celular). Sin framework ni BD.
- `lib/application/` — servicios con lógica de negocio (reservas, fidelidad, dashboard).
- `lib/infrastructure/` — detalles técnicos (seguridad, storage, logger, repositorios).
- `lib/http/` — infraestructura de las rutas (withRole, validación).
- `app/api/**` — rutas finas que orquestan; nunca contienen reglas de negocio nuevas.

No se adopta la separación estricta dominio/aplicación/infraestructura con
mappers y repositorios para todo: sería sobre-ingeniería para este tamaño.

## Consecuencias
- Cada capa extra evitada es un lugar menos donde perderse para un mantenedor no técnico.
- Las reglas que de verdad protegen el sistema se automatizan con fitness functions
  (`scripts/fitness-check.mjs`) en vez de con disciplina manual.
- Si algún día un equipo toma el proyecto, este ADR marca el punto de partida para
  profundizar la arquitectura.
