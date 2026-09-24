"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, CalendarCheck } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/servicios" },
    { name: "Galería", href: "/galeria" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Contacto", href: "/contacto" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-white/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex flex-col group items-start select-none">
          <span className="text-xl sm:text-2xl font-extrabold tracking-[0.22em] text-[#1A1A1A] group-hover:text-primary transition-colors uppercase">
            NAILS
          </span>
          <span className="text-[0.62rem] font-bold tracking-[0.32em] text-[#6B6B6B] -mt-1 uppercase">
            EXPRESS
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-[#1A1A1A] font-semibold" : "text-[#6B6B6B]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Mis Citas */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/mis-citas"
            className="text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Consultar o reprogramar cita"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-primary" />
            <span>Mis citas</span>
          </Link>
          <Link
            href="/reservar"
            className="btn-primary text-sm shadow-sm hover:shadow-md"
          >
            Reservar cita
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center space-x-2 md:hidden">
          <Link
            href="/reservar"
            className="btn-primary text-xs py-2 px-3.5"
          >
            Reservar
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-[#1A1A1A] hover:bg-gray-100 focus:outline-none"
            aria-label="Abrir menú"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-border px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-base font-medium text-[#1A1A1A] hover:text-primary border-b border-gray-50"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 flex flex-col space-y-2">
            <Link
              href="/mis-citas"
              onClick={() => setIsOpen(false)}
              className="py-2.5 px-4 text-sm font-medium text-center text-[#1A1A1A] bg-gray-100 rounded-btn flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-primary" />
              <span>Ver mis citas</span>
            </Link>
            <Link
              href="/reservar"
              onClick={() => setIsOpen(false)}
              className="btn-primary w-full text-center py-3 text-sm justify-center"
            >
              Reservar cita
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
