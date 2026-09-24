const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Nails Express database...");

  // 1. Settings
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      nombreNegocio: "Nails Express",
      telefono: "55 1234 5678",
      whatsapp: "+51 952 123 456",
      email: "hola@nailsexpress.com",
      direccion: "Av. San Martín 456, Tacna, Perú",
      linkMapa: "https://maps.google.com/?q=Tacna+Peru",
      horarioVisible: "Lun - Sáb 9:00 - 20:00",
      moneda: "S/",
      anticipacionMinimaHoras: 2,
      maximoDiasAdelante: 30,
      intervaloSlotsMinutos: 30,
      horasLimiteCancelacion: 12,
      heroKicker: "MANOS QUE HABLAN DE TI",
      heroTitulo: "Uñas increíbles, cuando tú quieras",
      heroSubtitulo:
        "Manicure, pedicure y diseños personalizados. Rápido, fácil y cerca de ti.",
      heroBoton: "Reservar ahora →",
      nosotrosTitulo: "Más que uñas, es bienestar",
      nosotrosTexto:
        "En Nails Express creemos que el cuidado personal también es una forma de amor propio. Nuestro equipo está comprometido en brindarte una experiencia única, con un servicio de calidad, en un ambiente cómodo y moderno.",
      nosotrosBoton: "Conoce más",
      metricasClientes: "+5,000",
      metricasCalificacion: "4.9",
      metricasAnos: "+3 años",
      instagramUrl: "https://instagram.com/nailsexpress",
      tiktokUrl: "https://tiktok.com/@nailsexpress",
      facebookUrl: "https://facebook.com/nailsexpress",
    },
  });

  // 2. Admin User
  await prisma.user.upsert({
    where: { email: "admin@nailsexpress.com" },
    update: {},
    create: {
      nombre: "Administrador Nails Express",
      email: "admin@nailsexpress.com",
      passwordHash: "admin123Nails!", // En producción usar bcrypt
      rol: "OWNER",
      activo: true,
    },
  });

  // 3. Staff (Manicuristas)
  const staff1 = await prisma.staff.upsert({
    where: { id: "staff-valentina" },
    update: {},
    create: {
      id: "staff-valentina",
      nombre: "Valentina Castro",
      foto: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&auto=format&fit=crop&q=80",
      color: "#5CC6BF",
      activo: true,
      bio: "Especialista en manicura en gel y diseños minimalistas contemporáneos.",
      orden: 1,
    },
  });

  const staff2 = await prisma.staff.upsert({
    where: { id: "staff-camila" },
    update: {},
    create: {
      id: "staff-camila",
      nombre: "Camila Paredes",
      foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      color: "#E8707A",
      activo: true,
      bio: "Experta en spa de pies, nail art avanzado y tratamientos de restauración.",
      orden: 2,
    },
  });

  // 4. Categories
  const catManicure = await prisma.serviceCategory.upsert({
    where: { slug: "manicure" },
    update: {},
    create: { nombre: "Manicure", slug: "manicure", orden: 1 },
  });

  const catPedicure = await prisma.serviceCategory.upsert({
    where: { slug: "pedicure" },
    update: {},
    create: { nombre: "Pedicure", slug: "pedicure", orden: 2 },
  });

  const catDisenos = await prisma.serviceCategory.upsert({
    where: { slug: "disenos" },
    update: {},
    create: { nombre: "Diseños", slug: "disenos", orden: 3 },
  });

  const catExtras = await prisma.serviceCategory.upsert({
    where: { slug: "extras" },
    update: {},
    create: { nombre: "Extras", slug: "extras", orden: 4 },
  });

  // 5. Services (From reference image 02 & 03)
  const servicesData = [
    {
      id: "srv-manicure-clasico",
      slug: "manicure-clasico",
      nombre: "Manicure Clásico",
      categoryId: catManicure.id,
      descripcionCorta:
        "Cuidado esencial para unas manos pulcras, suaves y naturales.",
      descripcionLarga:
        "Limpieza profunda de cutículas, limado anatómico, exfoliación con sales minerales, hidratación con aceites esenciales y esmaltado tradicional de larga duración.",
      precio: 30.0,
      precioDesde: false,
      duracionMinutos: 45,
      bufferMinutos: 15,
      imagenPrincipal:
        "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80",
      caracteristicas: JSON.stringify([
        "Duración: 45 min",
        "Esmaltado tradicional",
        "Limpieza y retiro de cutícula",
        "Masaje hidratante relajante",
        "Variedad de tonos clásicos",
      ]),
      coloresPopulares: JSON.stringify([
        "#F8BBD0",
        "#F48FB1",
        "#E91E63",
        "#D81B60",
        "#880E4F",
      ]),
      destacado: true,
      orden: 1,
    },
    {
      id: "srv-manicure-en-gel",
      slug: "manicure-en-gel",
      nombre: "Manicure en Gel",
      categoryId: catManicure.id,
      descripcionCorta:
        "Uñas perfectas, brillantes y duraderas por hasta 3 semanas.",
      descripcionLarga:
        "Uñas perfectas, brillantes y duraderas. Ideal para un look impecable por más tiempo sin descamación ni pérdida de color con curado en lámpara LED profesional.",
      precio: 39.0,
      precioDesde: false,
      duracionMinutos: 60,
      bufferMinutos: 15,
      imagenPrincipal:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80",
      caracteristicas: JSON.stringify([
        "Duración: 60 min",
        "Esmalte en gel de alta calidad",
        "Gran variedad de colores",
        "Incluye cuidado de cutícula",
        "Resultado brillante y resistente",
      ]),
      coloresPopulares: JSON.stringify([
        "#F48FB1",
        "#F8BBD0",
        "#C2185B",
        "#B71C1C",
        "#80CBC4",
        "#B39DDB",
        "#90A4AE",
      ]),
      destacado: true,
      orden: 2,
    },
    {
      id: "srv-pedicure-spa",
      slug: "pedicure-spa",
      nombre: "Pedicure Spa",
      categoryId: catPedicure.id,
      descripcionCorta:
        "Renovación completa para tus pies con tina de hidromasaje y exfoliación.",
      descripcionLarga:
        "Tratamiento intensivo con baño de burbujas aromatizadas, exfoliación de talones y plantas, mascarilla nutritiva, masaje podal estimulante y esmaltado impecable.",
      precio: 45.0,
      precioDesde: false,
      duracionMinutos: 60,
      bufferMinutos: 15,
      imagenPrincipal:
        "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&auto=format&fit=crop&q=80",
      caracteristicas: JSON.stringify([
        "Duración: 60 min",
        "Tina de hidromasaje relajante",
        "Exfoliación profunda de asperezas",
        "Mascarilla hidratante nutritiva",
        "Esmaltado en gel o clásico",
      ]),
      coloresPopulares: JSON.stringify([
        "#E91E63",
        "#AD1457",
        "#F8BBD0",
        "#E0E0E0",
      ]),
      destacado: true,
      orden: 3,
    },
    {
      id: "srv-disenos-personalizados",
      slug: "disenos-personalizados",
      nombre: "Diseños Personalizados",
      categoryId: catDisenos.id,
      descripcionCorta:
        "Arte a mano alzada, pedrería, efecto cromo y tendencias únicas.",
      descripcionLarga:
        "Nail art personalizado según tu estilo o referencia: trazos finos a mano alzada, french cromado, efecto aura, glitter encapsulado y cristales Swarovski.",
      precio: 60.0,
      precioDesde: true,
      duracionMinutos: 75,
      bufferMinutos: 15,
      imagenPrincipal:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
      caracteristicas: JSON.stringify([
        "Duración: 75 min",
        "Nail art exclusivo a mano alzada",
        "Efectos cromo, aurora y foil",
        "Pedrería y detalles de tendencia",
        "Asesoría de diseño personalizada",
      ]),
      coloresPopulares: JSON.stringify([
        "#212121",
        "#F8BBD0",
        "#80CBC4",
        "#FFD54F",
        "#CE93D8",
      ]),
      destacado: true,
      orden: 4,
    },
    {
      id: "srv-retiro-de-gel",
      slug: "retiro-de-gel",
      nombre: "Retiro de Gel",
      categoryId: catExtras.id,
      descripcionCorta:
        "Retiro profesional y seguro sin debilitar tu uña natural.",
      descripcionLarga:
        "Remoción cuidadosa de gel o acrílico mediante técnica vaporizadora y pulido suave, finalizando con un baño de queratina para fortalecer la placa ungueal.",
      precio: 15.0,
      precioDesde: false,
      duracionMinutos: 30,
      bufferMinutos: 10,
      imagenPrincipal:
        "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80",
      caracteristicas: JSON.stringify([
        "Duración: 30 min",
        "Retiro no abrasivo",
        "Protección de uña natural",
        "Tratamiento fortalecedor",
      ]),
      coloresPopulares: JSON.stringify(["#F5F5F5", "#E0E0E0"]),
      destacado: false,
      orden: 5,
    },
    {
      id: "srv-tratamiento-spa",
      slug: "tratamiento-spa",
      nombre: "Tratamiento Spa",
      categoryId: catExtras.id,
      descripcionCorta:
        "Hidratación profunda con parafina y colágeno para manos secas.",
      descripcionLarga:
        "Terapia regeneradora con baño tibio de parafina aromática, guantes térmicos, suero de colágeno puro y masaje antiedad para cutículas y piel maltratada.",
      precio: 35.0,
      precioDesde: false,
      duracionMinutos: 45,
      bufferMinutos: 15,
      imagenPrincipal:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80",
      caracteristicas: JSON.stringify([
        "Duración: 45 min",
        "Baño térmico de parafina",
        "Nutrición con colágeno y vitaminas",
        "Masaje antiedad intensivo",
      ]),
      coloresPopulares: JSON.stringify(["#F8BBD0", "#FFFFFF"]),
      destacado: false,
      orden: 6,
    },
  ];

  for (const srv of servicesData) {
    const service = await prisma.service.upsert({
      where: { slug: srv.slug },
      update: srv,
      create: srv,
    });

    // Asignar ambas manicuristas a todos los servicios
    await prisma.staffService.upsert({
      where: {
        staffId_serviceId: {
          staffId: staff1.id,
          serviceId: service.id,
        },
      },
      update: {},
      create: {
        staffId: staff1.id,
        serviceId: service.id,
      },
    });

    await prisma.staffService.upsert({
      where: {
        staffId_serviceId: {
          staffId: staff2.id,
          serviceId: service.id,
        },
      },
      update: {},
      create: {
        staffId: staff2.id,
        serviceId: service.id,
      },
    });
  }

  // 6. Business Hours (Lun - Sáb 9:00 - 20:00, Dom cerrado)
  const days = [
    { diaSemana: 0, horaApertura: "09:00", horaCierre: "14:00", cerrado: true },
    { diaSemana: 1, horaApertura: "09:00", horaCierre: "20:00", cerrado: false },
    { diaSemana: 2, horaApertura: "09:00", horaCierre: "20:00", cerrado: false },
    { diaSemana: 3, horaApertura: "09:00", horaCierre: "20:00", cerrado: false },
    { diaSemana: 4, horaApertura: "09:00", horaCierre: "20:00", cerrado: false },
    { diaSemana: 5, horaApertura: "09:00", horaCierre: "20:00", cerrado: false },
    { diaSemana: 6, horaApertura: "09:00", horaCierre: "20:00", cerrado: false },
  ];

  await prisma.businessHours.deleteMany({});
  for (const day of days) {
    await prisma.businessHours.create({
      data: {
        id: `hours-day-${day.diaSemana}`,
        ...day,
      },
    });
  }

  // 7. Blog Posts (Reference image 09)
  const blogPosts = [
    {
      slug: "5-tendencias-de-unas-para-esta-primavera",
      titulo: "5 tendencias de uñas para esta primavera",
      extracto:
        "Desde acabados aperlados hasta micromanicuras francesas en tonos pastel, descubre lo que arrasará esta temporada.",
      contenidoHtml: `
        <p>La primavera siempre trae consigo una renovación de energías y colores. En Nails Express hemos recopilado las 5 tendencias indispensables que verás en todas las pasarelas y salones este año.</p>
        <h2>1. French pastel con toque cromo</h2>
        <p>La clásica punta blanca se reinventa con matices menta, lavanda y durazno suave, sellados con polvo de efecto cromo perlado que aporta un brillo de porcelana.</p>
        <h2>2. Acabado 'Clean Girl' Soap Nails</h2>
        <p>Uñas impecablemente pulidas con una capa translúcida rosada que simula el brillo de unas manos recién lavadas con jabón artesanal.</p>
        <h2>3. Diseños florales micro-artísticos</h2>
        <p>Pequeñas margaritas y flores silvestres pintadas a mano alzada con pinceles número cero sobre bases nude.</p>
      `,
      imagenPortada:
        "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80",
      categoria: "Tendencias",
      estado: "PUBLICADO",
      fechaPublicacion: new Date("2026-03-12T10:00:00Z"),
      autor: "Nails Express",
      destacado: true,
    },
    {
      slug: "como-cuidar-tus-unas-despues-del-gel",
      titulo: "Cómo cuidar tus uñas después del gel",
      extracto:
        "Consejos expertos para mantener la hidratación, evitar la fragilidad y lucir una cutícula sana e hidratada.",
      contenidoHtml: `
        <p>El gel es maravilloso por su duración, pero el cuidado de la uña natural entre aplicaciones es la clave para que se mantenga fuerte y flexible.</p>
        <h2>Aplica aceite de cutícula dos veces al día</h2>
        <p>El aceite penetra a través de los laterales de la uña nutriendo la matriz ungueal desde adentro.</p>
        <h2>Nunca desprendas el gel con los dientes o espátulas</h2>
        <p>Arrancar el gel desprende las capas superficiales de queratina. Siempre acude a un retiro profesional seguro.</p>
      `,
      imagenPortada:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80",
      categoria: "Cuidado",
      estado: "PUBLICADO",
      fechaPublicacion: new Date("2026-03-08T10:00:00Z"),
      autor: "Valentina Castro",
      destacado: true,
    },
    {
      slug: "colores-que-seran-furor-en-2026",
      titulo: "Colores que serán furor en 2026",
      extracto:
        "Descubre la paleta cromática dominante: tonos terrosos suaves, verde matcha y el infaltable rosa blush.",
      contenidoHtml: `
        <p>Las colecciones internacionales de belleza han hablado. Estos son los tonos que dominarán las cartas de color en los salones más prestigiosos.</p>
        <h2>Verde Matcha y Menta Suave</h2>
        <p>Frescura botánica que transmite calma y sofisticación tanto en uñas cortas cuadradas como almendradas.</p>
        <h2>Rosa Blush Translúcido</h2>
        <p>El neutro por excelencia que estiliza visualmente las manos y combina con cualquier atuendo.</p>
      `,
      imagenPortada:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
      categoria: "Tendencias",
      estado: "PUBLICADO",
      fechaPublicacion: new Date("2026-03-01T10:00:00Z"),
      autor: "Camila Paredes",
      destacado: true,
    },
  ];

  for (const post of blogPosts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  // 8. FAQs (Reference image 11)
  const faqsData = [
    {
      id: "faq-1",
      pregunta: "¿Cuánto dura un manicure en gel?",
      respuesta:
        "El manicure en gel puede durar de 2 a 3 semanas, dependiendo del cuidado y crecimiento de tus uñas. En Nails Express aplicamos productos profesionales con preparación ultra-limpia para garantizar máxima adherencia y brillo continuo.",
      orden: 1,
      visible: true,
    },
    {
      id: "faq-2",
      pregunta: "¿Necesito cita previa?",
      respuesta:
        "Sí, te recomendamos reservar tu cita con anticipación mediante nuestra web para asegurarte el horario de tu preferencia y evitar esperas. Nuestro sistema reserva turnos en tiempo real con cero cruces.",
      orden: 2,
      visible: true,
    },
    {
      id: "faq-3",
      pregunta: "¿Qué métodos de pago aceptan?",
      respuesta:
        "Aceptamos pagos en efectivo, transferencias móviles vía Yape y Plin, así como todas las tarjetas de débito y crédito (Visa, Mastercard, American Express) sin recargo.",
      orden: 3,
      visible: true,
    },
    {
      id: "faq-4",
      pregunta: "¿Puedo modificar o cancelar mi cita?",
      respuesta:
        "Sí, puedes reprogramar o cancelar tu cita fácilmente desde la sección 'Mis Citas' o a través del enlace enviado a tu correo o WhatsApp, con al menos 12 horas de anticipación sin penalidad.",
      orden: 4,
      visible: true,
    },
    {
      id: "faq-5",
      pregunta: "¿Utilizan productos libres de crueldad animal?",
      respuesta:
        "Totalmente. Todos nuestros esmaltes, geles, lociones y exfoliantes son certificados 100% cruelty-free y formulados sin sustancias tóxicas dañinas como formaldehído ni tolueno.",
      orden: 5,
      visible: true,
    },
  ];

  for (const faq of faqsData) {
    await prisma.faq.upsert({
      where: { id: faq.id },
      update: faq,
      create: faq,
    });
  }

  // 9. Gallery Items (Reference image 07)
  const galleryItems = [
    {
      id: "gal-1",
      imagen:
        "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80",
      categoria: "Manicure",
      altText: "Manicure en gel con tonos nude brillantes y delicados",
      orden: 1,
    },
    {
      id: "gal-2",
      imagen:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80",
      categoria: "Diseños",
      altText: "Diseño micro floral con foil plateado",
      orden: 2,
    },
    {
      id: "gal-3",
      imagen:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
      categoria: "Diseños",
      altText: "French cromado y diseño minimalista en blanco y oro",
      orden: 3,
    },
    {
      id: "gal-4",
      imagen:
        "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&auto=format&fit=crop&q=80",
      categoria: "Pedicure",
      altText: "Pedicure spa con esmaltado durazno brillante",
      orden: 4,
    },
    {
      id: "gal-5",
      imagen:
        "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=800&auto=format&fit=crop&q=80",
      categoria: "Temporada",
      altText: "Uñas en tono rosa blush con glitter suave de temporada",
      orden: 5,
    },
    {
      id: "gal-6",
      imagen:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80",
      categoria: "Manicure",
      altText: "Manicure pastel en verde menta y lila",
      orden: 6,
    },
    {
      id: "gal-7",
      imagen:
        "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=800&auto=format&fit=crop&q=80",
      categoria: "Diseños",
      altText: "Nail art con líneas geométricas y acentos dorados",
      orden: 7,
    },
    {
      id: "gal-8",
      imagen:
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&auto=format&fit=crop&q=80",
      categoria: "Temporada",
      altText: "Efecto glazed donut nails perlado",
      orden: 8,
    },
  ];

  for (const item of galleryItems) {
    await prisma.galleryItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  // 10. Sample Customer and Initial Appointments (to populate Admin Agenda)
  const customer = await prisma.customer.upsert({
    where: { celular: "+51952000111" },
    update: {},
    create: {
      nombre: "Luciana Morales",
      celular: "+51952000111",
      email: "luciana.morales@gmail.com",
      notasInternas: "Prefiere limado almendrado y cutícula delicada.",
      totalCitas: 1,
      inasistencias: 0,
    },
  });

  // Fecha para hoy en horario de la tarde
  const today = new Date();
  today.setHours(11, 0, 0, 0);
  const endToday = new Date(today);
  endToday.setMinutes(endToday.getMinutes() + 75); // 60 min servicio + 15 buffer

  await prisma.appointment.upsert({
    where: { codigo: "NX-7K3P" },
    update: {},
    create: {
      codigo: "NX-7K3P",
      customerId: customer.id,
      serviceId: "srv-manicure-en-gel",
      staffId: staff1.id,
      startAt: today,
      endAt: endToday,
      precio: 39.0,
      estado: "CONFIRMADA",
      origen: "WEB",
      notasCliente: "Tono pastel preferido para evento familiar.",
    },
  });

  console.log("Database seeded successfully with all initial records!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
