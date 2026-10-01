-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ADMIN',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "staffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "foto" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#5CC6BF',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "bio" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "descripcionCorta" TEXT NOT NULL,
    "descripcionLarga" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "precioDesde" BOOLEAN NOT NULL DEFAULT false,
    "duracionMinutos" INTEGER NOT NULL DEFAULT 60,
    "bufferMinutos" INTEGER NOT NULL DEFAULT 15,
    "imagenPrincipal" TEXT NOT NULL,
    "galeria" TEXT,
    "caracteristicas" TEXT NOT NULL,
    "coloresPopulares" TEXT NOT NULL,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffService" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "StaffService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "email" TEXT,
    "notasInternas" TEXT,
    "totalCitas" INTEGER NOT NULL DEFAULT 0,
    "inasistencias" INTEGER NOT NULL DEFAULT 0,
    "ultimaVisita" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "origen" TEXT NOT NULL DEFAULT 'WEB',
    "notasCliente" TEXT,
    "notasInternas" TEXT,
    "canceladoPor" TEXT,
    "motivoCancelacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentLog" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "detalle" TEXT,
    "realizadoPor" TEXT NOT NULL DEFAULT 'SISTEMA',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessHours" (
    "id" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaApertura" TEXT NOT NULL,
    "horaCierre" TEXT NOT NULL,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    "staffId" TEXT,

    CONSTRAINT "BusinessHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeBlock" (
    "id" TEXT NOT NULL,
    "staffId" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "extracto" TEXT NOT NULL,
    "contenidoHtml" TEXT NOT NULL,
    "contenidoJson" TEXT,
    "imagenPortada" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'Tendencias',
    "estado" TEXT NOT NULL DEFAULT 'PUBLICADO',
    "fechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autor" TEXT NOT NULL DEFAULT 'Nails Express',
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "imagen" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "serviceId" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "nombreNegocio" TEXT NOT NULL DEFAULT 'Nails Express',
    "logo" TEXT,
    "telefono" TEXT NOT NULL DEFAULT '55 1234 5678',
    "whatsapp" TEXT NOT NULL DEFAULT '+51 952 123 456',
    "email" TEXT NOT NULL DEFAULT 'hola@nailsexpress.com',
    "direccion" TEXT NOT NULL DEFAULT 'Av. San Martín 456, Tacna, Perú',
    "linkMapa" TEXT NOT NULL DEFAULT 'https://maps.google.com',
    "horarioVisible" TEXT NOT NULL DEFAULT 'Lun - Sáb 9:00 - 20:00',
    "moneda" TEXT NOT NULL DEFAULT 'S/',
    "anticipacionMinimaHoras" INTEGER NOT NULL DEFAULT 2,
    "maximoDiasAdelante" INTEGER NOT NULL DEFAULT 30,
    "intervaloSlotsMinutos" INTEGER NOT NULL DEFAULT 30,
    "horasLimiteCancelacion" INTEGER NOT NULL DEFAULT 12,
    "heroKicker" TEXT NOT NULL DEFAULT 'MANOS QUE HABLAN DE TI',
    "heroTitulo" TEXT NOT NULL DEFAULT 'Uñas increíbles,',
    "heroSubtitulo" TEXT NOT NULL DEFAULT 'Manicure, pedicure y diseños personalizados. Rápido, fácil y cerca de ti.',
    "heroBoton" TEXT NOT NULL DEFAULT 'Reservar ahora →',
    "nosotrosTitulo" TEXT NOT NULL DEFAULT 'Más que uñas, es bienestar',
    "nosotrosTexto" TEXT NOT NULL DEFAULT 'En Nails Express creemos que el cuidado personal también es una forma de amor propio. Nuestro equipo está comprometido en brindarte una experiencia única, con un servicio de calidad, en un ambiente cómodo y moderno.',
    "nosotrosBoton" TEXT NOT NULL DEFAULT 'Conoce más',
    "metricasClientes" TEXT NOT NULL DEFAULT '+5,000',
    "metricasCalificacion" TEXT NOT NULL DEFAULT '4.9',
    "metricasAnos" TEXT NOT NULL DEFAULT '+3 años',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://instagram.com/nailsexpress',
    "tiktokUrl" TEXT NOT NULL DEFAULT 'https://tiktok.com/@nailsexpress',
    "facebookUrl" TEXT NOT NULL DEFAULT 'https://facebook.com/nailsexpress',
    "logoTextoPrincipal" TEXT NOT NULL DEFAULT 'NAILS',
    "logoTextoSecundario" TEXT NOT NULL DEFAULT 'EXPRESS',
    "menuLinks" TEXT NOT NULL DEFAULT 'Inicio|/
Servicios|/servicios
Galería|/galeria
Nosotros|/nosotros
Blog|/blog
Contacto|/contacto',
    "headerBoton" TEXT NOT NULL DEFAULT 'Reservar cita',
    "heroTituloItalico" TEXT NOT NULL DEFAULT 'cuando tú quieras',
    "heroImagen" TEXT NOT NULL DEFAULT '/images/hero-hands.jpg',
    "heroImagenAlt" TEXT NOT NULL DEFAULT 'Uñas increíbles Nails Express',
    "heroCaligrafia" TEXT NOT NULL DEFAULT 'Good Nails
Good Mood ♡',
    "heroBadge1Titulo" TEXT NOT NULL DEFAULT 'Calidad',
    "heroBadge1Texto" TEXT NOT NULL DEFAULT 'en cada servicio',
    "heroBadge2Titulo" TEXT NOT NULL DEFAULT 'En el horario',
    "heroBadge2Texto" TEXT NOT NULL DEFAULT 'que prefieras',
    "heroBadge3Titulo" TEXT NOT NULL DEFAULT 'Resultados',
    "heroBadge3Texto" TEXT NOT NULL DEFAULT 'que amarás',
    "serviciosTitulo" TEXT NOT NULL DEFAULT 'Nuestros servicios',
    "serviciosSubtitulo" TEXT NOT NULL DEFAULT 'Belleza y cuidado en cada detalle.',
    "serviciosBotonTodos" TEXT NOT NULL DEFAULT 'Ver todos',
    "reservaRapidaTitulo" TEXT NOT NULL DEFAULT 'Reserva tu cita',
    "reservaRapidaSubtitulo" TEXT NOT NULL DEFAULT 'Es rápido y sencillo',
    "reservaRapidaBoton" TEXT NOT NULL DEFAULT 'Continuar',
    "nosotrosImagen" TEXT NOT NULL DEFAULT '/images/salon-interior.jpg',
    "nosotrosImagenAlt" TEXT NOT NULL DEFAULT 'Instalaciones de Nails Express',
    "metricasClientesLabel" TEXT NOT NULL DEFAULT 'Clientes felices',
    "metricasCalificacionLabel" TEXT NOT NULL DEFAULT 'Calificación promedio',
    "metricasAnosLabel" TEXT NOT NULL DEFAULT 'Cuidando de ti',
    "galeriaTitulo" TEXT NOT NULL DEFAULT 'Galería de inspiración',
    "galeriaSubtitulo" TEXT NOT NULL DEFAULT 'Ideas reales, para uñas reales.',
    "blogTitulo" TEXT NOT NULL DEFAULT 'Consejos y tendencias',
    "blogSubtitulo" TEXT NOT NULL DEFAULT 'Todo sobre el mundo de las uñas, en un solo lugar.',
    "faqTitulo" TEXT NOT NULL DEFAULT 'Preguntas frecuentes',
    "faqSubtitulo" TEXT NOT NULL DEFAULT 'Resolvemos tus dudas.',
    "contactoTitulo" TEXT NOT NULL DEFAULT 'Contáctanos',
    "contactoSubtitulo" TEXT NOT NULL DEFAULT '¿Tienes dudas o quieres más información? ¡Escríbenos!',
    "contactoImagen" TEXT NOT NULL DEFAULT '/images/neon-sign.jpg',
    "contactoImagenAlt" TEXT NOT NULL DEFAULT 'Letrero neón Nails Express',
    "contactoBotonWhatsapp" TEXT NOT NULL DEFAULT 'Escríbenos a WhatsApp',
    "mapaEmbedUrl" TEXT NOT NULL DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15197.669614742874!2d-70.25413346473133!3d-18.01386762391697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915acf5dfeb6e60b%3A0xe5567b57b545f47!2sTacna%2C%20Per%C3%BA!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe',
    "mostrarMapa" BOOLEAN NOT NULL DEFAULT true,
    "whatsappMensaje" TEXT NOT NULL DEFAULT '¡Hola Nails Express! Me gustaría consultar sobre sus servicios y citas.',
    "whatsappBotonTexto" TEXT NOT NULL DEFAULT 'WhatsApp',
    "footerDescripcion" TEXT NOT NULL DEFAULT 'Belleza, bienestar y confianza en un solo lugar.',
    "footerCopyright" TEXT NOT NULL DEFAULT 'Todos los derechos reservados.',
    "footerFrase" TEXT NOT NULL DEFAULT 'Hecho con ♡ para uñas increíbles.',
    "footerLinks" TEXT NOT NULL DEFAULT 'Inicio|/
Servicios|/servicios
Galería|/galeria
Nosotros|/nosotros
Contacto|/contacto
Consultar cita|/mis-citas',
    "seoTitulo" TEXT NOT NULL DEFAULT 'Nails Express | Salón y Estudio de Uñas en Tacna',
    "seoDescripcion" TEXT NOT NULL DEFAULT 'Estudio de uñas profesional en Tacna, Perú. Manicure clásico, manicure en gel, pedicure spa y diseños personalizados. Reserva tu cita en línea con disponibilidad en tiempo real.',
    "seoKeywords" TEXT NOT NULL DEFAULT 'uñas tacna, manicure tacna, pedicure tacna, uñas en gel tacna, nails express',
    "ciudad" TEXT NOT NULL DEFAULT 'Tacna',
    "pais" TEXT NOT NULL DEFAULT 'PE',
    "codigoPostal" TEXT NOT NULL DEFAULT '23001',
    "latitud" TEXT NOT NULL DEFAULT '-18.013867',
    "longitud" TEXT NOT NULL DEFAULT '-70.254133',
    "rangoPrecios" TEXT NOT NULL DEFAULT 'S/ 15 - S/ 90',
    "metodosPago" TEXT NOT NULL DEFAULT 'Efectivo, Tarjeta, Yape, Plin',
    "blogCtaTitulo" TEXT NOT NULL DEFAULT '¿Te gustaría lucir un diseño como este?',
    "blogCtaTexto" TEXT NOT NULL DEFAULT 'Nuestras manicuristas expertas harán realidad tu idea con la mayor precisión y cuidado.',
    "blogCtaBoton" TEXT NOT NULL DEFAULT 'Reservar cita ahora',
    "servicioRating" TEXT NOT NULL DEFAULT '4.9',
    "servicioRatingTexto" TEXT NOT NULL DEFAULT '(120 reseñas)',
    "dashBadgeCitasHoy" TEXT NOT NULL DEFAULT '+14% vs ayer',
    "dashSubCitasHoy" TEXT NOT NULL DEFAULT '100% libre de cruces',
    "dashBadgeSemana" TEXT NOT NULL DEFAULT '+8% semanal',
    "dashBadgeIngresos" TEXT NOT NULL DEFAULT 'Proyección activa',
    "dashBadgeInasistencia" TEXT NOT NULL DEFAULT 'Bajo control',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_nombre_key" ON "ServiceCategory"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "StaffService_staffId_serviceId_key" ON "StaffService"("staffId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_celular_key" ON "Customer"("celular");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_codigo_key" ON "Appointment"("codigo");

-- CreateIndex
CREATE INDEX "Appointment_staffId_startAt_endAt_idx" ON "Appointment"("staffId", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "Appointment_startAt_idx" ON "Appointment"("startAt");

-- CreateIndex
CREATE INDEX "Appointment_codigo_idx" ON "Appointment"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffService" ADD CONSTRAINT "StaffService_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffService" ADD CONSTRAINT "StaffService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentLog" ADD CONSTRAINT "AppointmentLog_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeBlock" ADD CONSTRAINT "TimeBlock_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

