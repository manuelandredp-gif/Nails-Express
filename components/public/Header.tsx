"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Calendar } from "lucide-react";
import type { SiteLink } from "@/lib/site-content";

interface HeaderProps {
  logo?: string | null;
  logoTextoPrincipal: string;
  logoTextoSecundario: string;
  nombreNegocio: string;
  navLinks: SiteLink[];
  botonTexto: string;
}

export default function Header({
  logo,
  logoTextoPrincipal,
  logoTextoSecundario,
  nombreNegocio,
  navLinks,
  botonTexto,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-2xs border-b border-gray-100"
          : "bg-white/90 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex flex-col items-start select-none group">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={nombreNegocio} className="h-10 w-auto object-contain" />
          ) : (
            <>
              <span className="text-xl sm:text-2xl font-black tracking-[0.22em] text-[#1A1A1A] uppercase font-sans">
                {logoTextoPrincipal}
              </span>
              <span className="text-[0.58rem] font-bold tracking-[0.34em] text-[#8E8E8E] -mt-1 uppercase">
                {logoTextoSecundario}
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-7">
          {navLinks.map((link) => (
            <Link
              key={link.href + link.name}
              href={link.href}
              className={`text-sm transition-all pb-1 ${
                isActive(link.href)
                  ? "text-[#1A1A1A] font-bold border-b-2 border-[#1A1A1A]"
                  : "text-[#5A5A5A] hover:text-[#1A1A1A] font-medium"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-5">
          <Link
            href="/reservar"
            className="bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl inline-flex items-center gap-2 shadow-xs transition-all hover:scale-102"
          >
            <Calendar className="w-4 h-4" />
            <span>{botonTexto}</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center space-x-2 md:hidden">
          <Link href="/reservar" className="btn-primary text-xs py-2 px-3.5">
            {botonTexto}
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

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href + link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block py-2 text-sm ${
                isActive(link.href) ? "text-primary font-bold" : "text-[#5A5A5A]"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link
              href="/mis-citas"
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-600 py-1"
            >
              Consultar o reprogramar cita (Mis Citas)
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-400 py-1"
            >
              Acceso Staff / Administración
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
