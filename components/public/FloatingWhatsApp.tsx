"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

interface FloatingWhatsAppProps {
  href: string;
  label: string;
}

export default function FloatingWhatsApp({ href, label }: FloatingWhatsAppProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="wa-pulse fixed bottom-6 right-6 z-40 bg-[#25D366] text-[#25D366] hover:brightness-105 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center group p-3.5"
      style={{ color: "#25D366" }}
    >
      <MessageCircle className="w-6 h-6 text-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-semibold px-0 group-hover:px-2 text-white">
        {label}
      </span>
    </a>
  );
}
