import React from "react";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import FloatingWhatsApp from "@/components/public/FloatingWhatsApp";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NailSalon",
    name: "Nails Express",
    image: "https://nailsexpress.com/images/hero-hands.jpg",
    telephone: "+51 952 123 456",
    email: "hola@nailsexpress.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. San Martín 456",
      addressLocality: "Tacna",
      addressRegion: "Tacna",
      postalCode: "23001",
      addressCountry: "PE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -18.013867,
      longitude: -70.254133,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "20:00",
      },
    ],
    priceRange: "S/ 15 - S/ 90",
    currenciesAccepted: "PEN",
    paymentAccepted: "Cash, Credit Card, Debit Card, Yape, Plin",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
