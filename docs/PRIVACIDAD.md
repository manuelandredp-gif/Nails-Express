# Protección de datos personales — Nails Express

Guía interna de cumplimiento (Ley 29733 de Protección de Datos Personales, Perú).
Esto es una base operativa, no asesoría legal.

## Qué datos personales guarda el sistema
- **Clientas:** nombre, celular, correo (opcional), notas internas, historial de citas.
- **Empleadas:** nombre, DNI, teléfono, correo, dirección.

## Quién accede (ya implementado técnicamente)
- **Dueña / Administración:** acceso total.
- **Recepción:** ve todas las citas y clientas que atiende; no ve la caja ni edita la web.
- **Manicurista:** solo sus propias citas. No ve DNI/dirección de otras empleadas.
- Las cuentas se crean, suspenden y eliminan desde **Equipo y Accesos**.

## Pendientes de negocio (decisión de la dueña)
1. **Aviso de privacidad en la web pública:** al reservar, informar para qué se usan
   los datos y cómo pedir su baja. (Texto corto en la página de reserva.)
2. **Retención:** definir cuánto se guardan los datos de clientas inactivas y de
   ex-empleadas, y borrarlos pasado ese plazo. Sugerencia: fichas de ex-empleadas
   se eliminan al cesar (el botón "eliminar empleada" ya borra su ficha si no tiene
   historial, o la desactiva si lo tiene).
3. **Respaldo:** exportar la base de datos una vez al mes (Supabase → Database →
   Backups, o `pg_dump`). El plan gratuito no garantiza respaldos a largo plazo.

## Buenas prácticas ya aplicadas
- Contraseñas con scrypt (nunca en texto plano).
- Acceso al panel protegido por sesión + rol en middleware, página y API.
- Las notas y reseñas de clientas son privadas (no se publican en la web).
