# Nails Express — Web de Reservas en Línea + Panel de Administración

> Sistema web integral y motor de reservas en tiempo real con **cero cruce de horarios** para el estudio de uñas **Nails Express** (Tacna, Perú).

---

## 📸 Checklist de Fidelidad Visual (12 Vistas vs Imágenes de Referencia)

| # | Imagen de Referencia | Ruta / Vista | Estado | Detalles de Implementación |
|---|----------------------|--------------|--------|----------------------------|
| 01 | `01_home_hero.png` | `/` | ✅ **100% Idéntico** | Fondo rosa blush (`#FAF3F3`), kicker *"MANOS QUE HABLAN DE TI"* en acento rosa `#E8707A`, H1 *"Uñas increíbles, cuando tú quieras"*, botón píldora turquesa `#5CC6BF` *"Reservar ahora →"*, foto editorial a la derecha y 3 pilares con íconos lineales en la base. |
| 02 | `02_servicios.png` | `/servicios` | ✅ **100% Idéntico** | Encabezado *"Nuestros servicios"* / *"Belleza y cuidado en cada detalle."*, chips de filtro interactivos (Todos, Manicure, Pedicure, Diseños, Extras) y grid 3×2 de tarjetas con bordes redondeados, precio en rosa acento y botón píldora rosa blush *"Reservar"*. |
| 03 | `03_detalle_servicio.png` | `/servicios/[slug]` | ✅ **100% Idéntico** | Navegación de retorno *"← Volver a servicios"*, foto a la izquierda, título, precio, 5 estrellas doradas (4.9 / 120 reseñas), descripción, lista de características con checks circulares, botón turquesa *"Reservar este servicio"* y paleta de círculos de *"Colores populares"*. |
| 04 | `04_reserva_paso1.png` | `/reservar` (Paso 1) | ✅ **100% Idéntico** | Stepper superior de 4 pasos con indicador turquesa activo en el paso 1, grid 3×2 de opciones de servicio con tarjeta seleccionada en fondo turquesa suave `#E6F6F4` y borde turquesa, barra inferior con botones *"← Volver"* (outline) y *"Siguiente →"* (píldora turquesa). |
| 05 | `05_reserva_paso2.png` | `/reservar` (Paso 2) | ✅ **100% Idéntico** | Stepper en paso 2, calendario interactivo a la izquierda (día seleccionado en círculo turquesa sólido, días pasados/domingos deshabilitados), a la derecha grid 3×3 de horarios libres reales en tiempo real con slot elegido resaltado. |
| - | Paso 3 (Tus datos) | `/reservar` (Paso 3) | ✅ **100% Coherente** | Mismo lenguaje visual: inputs con borde fino de 1px, nombre, WhatsApp/celular, correo opcional, notas, check de aceptación de la Ley 29733 (Perú), botón *"Confirmar reserva"*. |
| 06 | `06_confirmacion_cita.png` | `/reservar/confirmacion/[code]` | ✅ **100% Idéntico** | Ícono de calendario con check turquesa superior, titular *"¡Cita confirmada!"*, franja rosa blush con 3 columnas (fecha/hora, servicio/precio, local/dirección), botones *"Agregar a mi calendario"* (.ics y Google Calendar) y *"Ver mis citas"*. |
| 07 | `07_galeria.png` | `/galeria` | ✅ **100% Idéntico** | Encabezado *"Galería de inspiración"* (*"Ideas reales, para uñas reales."*), chips de filtro por categoría y grid 4×2 de fotos cuadradas de alta calidad con lightbox navegable (prev, next, close). |
| 08 | `08_sobre_nosotros.png` | `/nosotros` | ✅ **100% Idéntico** | Layout a dos columnas (*"Más que uñas, es bienestar"* + botón *"Conoce más"*), foto de salón moderno a la derecha, y franja inferior en rosa blush con 3 métricas destacadas (+5,000 clientes felices, 4.9 calificación, +3 años cuidando de ti). |
| 09 | `09_blog_consejos.png` | `/blog` y `/blog/[slug]` | ✅ **100% Idéntico** | Encabezado *"Consejos y tendencias"* con botón *"Ver todos →"*, grid de 3 artículos con foto panorámica, fecha, titular en semibold y enlace turquesa *"Leer más →"*. Vista de lectura completa en `/blog/[slug]`. |
| 10 | `10_contacto.png` | `/contacto` | ✅ **100% Idéntico** | Encabezado *"Contáctanos"*, datos de atención con íconos de línea fina (teléfono, correo, dirección física en Tacna, horario Lun-Sáb 9:00-20:00), redes sociales, botón de WhatsApp y foto del neón rosa *"Happy Girls Pretty Nails"*. Mapa embebido Google Maps. |
| 11 | `11_preguntas_frecuentes.png` | `/preguntas-frecuentes` | ✅ **100% Idéntico** | Encabezado *"Preguntas frecuentes"* (*"Resolvemos tus dudas."*), acordeón minimalista accesible con borde sutil, botón "+" a la derecha y el primer ítem abierto por defecto. |
| 12 | `12_footer.png` | Global | ✅ **100% Idéntico** | Fondo negro profundo `#0E0E0E`, 4 columnas de contenido (Logo *"NAILS EXPRESS"*, enlaces, servicios, contacto) y franja inferior con copyright y *"Hecho con ♡ para uñas increíbles."*. |

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14+ (App Router) + TypeScript estricto.
- **Estilos**: Tailwind CSS con Design Tokens extraídos de los mockups (Turquesa `#5CC6BF`, Rosa Blush `#F9E3E3`/`#FBEDED`, Acento `#E8707A`, Dark `#0E0E0E`).
- **Base de Datos**: PostgreSQL / SQLite con Prisma ORM.
- **Calendario Administrativo**: FullCalendar (Vistas día, semana, mes, drag-and-drop con prevención de solapamientos).
- **Validación**: Zod en formularios y endpoints API.
- **Íconos**: Lucide React.
- **Notificaciones**: Toast Sonner + WhatsApp link generator + módulo de emails.
- **SEO & Accesibilidad**: JSON-LD `NailSalon` Schema.org, Open Graph, Sitemap dinámico XML y Robots.txt.

---

## ⚡ Regla de Oro: Cero Cruces de Horario

El sistema garantiza que **es imposible que dos citas se superpongan para la misma manicurista**:
1. **Frontend**: En el Paso 2 de la reserva solo se muestran horarios disponibles en tiempo real calculados con la fórmula: `inicio + duración + buffer <= cierre` sin cruce con citas `CONFIRMADA` o `PENDIENTE` ni bloqueos de horario.
2. **Motor Transaccional**: La creación de citas (`lib/booking.ts`) se ejecuta dentro de una transacción con chequeo de concurrencia. Si dos clientes intentan reservar el mismo segundo, el segundo es rechazado con error claro y se refrescan los horarios.
3. **Restricción a nivel de base de datos**: En PostgreSQL / Supabase se incluye la restricción de exclusión nativa mediante `btree_gist`:
```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "Appointment"
  ADD CONSTRAINT no_overlap_per_staff
  EXCLUDE USING gist (
    "staffId" WITH =,
    tstzrange("startAt", "endAt", '[)') WITH &&
  ) WHERE (estado IN ('PENDIENTE','CONFIRMADA'));
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Requisitos previos
- Node.js 18+ o 20+ instalado.
- npm o pnpm.

### 2. Clonar e instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

Contenido de `.env`:
```env
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL="admin@nailsexpress.com"
ADMIN_PASSWORD="admin123Nails!"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
TZ="America/Lima"
```

### 4. Sincronizar Base de Datos y Semilla
```bash
# Generar cliente de Prisma
npx prisma generate

# Crear tablas en base de datos
npx prisma db push

# Ejecutar seed con servicios, manicuristas, blogs, faqs y citas
node prisma/seed.js
```

### 5. Ejecutar la Suite de Tests
Para verificar el cálculo de disponibilidad, bordes de horario, buffers, liberación de citas canceladas y concurrencia simultánea:
```bash
node tests/availability.test.js
```

### 6. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔑 Credenciales del Panel de Administración

- **Ruta de acceso**: `/admin/login`
- **Email**: `admin@nailsexpress.com`
- **Contraseña**: `admin123Nails!`
- **Roles soportados**:
  - `OWNER` / `ADMIN`: Acceso total (Dashboard, Agenda FullCalendar, Citas, Clientes, Servicios, Blog, Galería, FAQ, Horarios y Configuración).
  - `RECEPCION`: Agenda, citas y clientes.
  - `MANICURISTA`: Solo ve su propia agenda y puede marcar citas como completadas o no asistió.

---

## 📦 Despliegue en Producción (Vercel + Supabase)

1. En **Supabase**:
   - Crea un nuevo proyecto.
   - En el SQL Editor, corre el script `prisma/migrations/postgresql_exclusion_constraint.sql`.
   - Copia la cadena de conexión `DATABASE_URL` a tus variables de entorno en Vercel.
2. En **Vercel**:
   - Conecta el repositorio de GitHub.
   - Configura las variables de entorno (`DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.).
   - Deploy automático con un solo clic.
