"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Scissors,
  FileText,
  Image as ImageIcon,
  Instagram,
  HelpCircle,
  CalendarRange,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  UserCheck,
  Wallet,
  Star,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

interface AdminSidebarProps {
  user: {
    nombre: string;
    email: string;
    rol: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isManager = user.rol === "OWNER" || user.rol === "ADMIN";

  // Links visibles para todos los usuarios (incluye trabajadoras).
  const baseItems = [
    { name: "Agenda", href: "/admin/agenda", icon: Calendar },
    { name: "Citas", href: "/admin/citas", icon: Clock },
  ];

  const accountItem = { name: "Mi cuenta", href: "/admin/cuenta", icon: KeyRound };

  // Links solo para la dueña / administración.
  const managerItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Caja", href: "/admin/caja", icon: Wallet },
    { name: "Clientes", href: "/admin/clientes", icon: Users },
    { name: "Servicios", href: "/admin/servicios", icon: Scissors },
    { name: "Blog / Publicaciones", href: "/admin/publicaciones", icon: FileText },
    { name: "Galería", href: "/admin/galeria", icon: ImageIcon },
    { name: "Instagram", href: "/admin/instagram", icon: Instagram },
    { name: "Preguntas Frecuentes", href: "/admin/faq", icon: HelpCircle },
    { name: "Testimonios", href: "/admin/testimonios", icon: Star },
    { name: "Horarios y Equipo", href: "/admin/horarios", icon: CalendarRange },
    { name: "Equipo / Accesos", href: "/admin/equipo", icon: UserCheck },
    { name: "Configuración", href: "/admin/configuracion", icon: Settings },
  ];

  const navItems = isManager
    ? [managerItems[0], ...baseItems, ...managerItems.slice(1), accountItem]
    : [...baseItems, accountItem];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Sesión cerrada");
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      router.push("/admin/login");
    }
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#ECECEC] sticky top-0 z-40">
        <Link href="/admin" className="flex flex-col items-start select-none">
          <span className="text-lg font-extrabold tracking-[0.2em] text-[#1A1A1A] uppercase">
            NAILS
          </span>
          <span className="text-[0.55rem] font-bold tracking-[0.3em] text-[#6B6B6B] -mt-1 uppercase">
            EXPRESS
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#ECECEC] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header Brand */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
            <Link href="/admin" className="flex flex-col items-start select-none">
              <span className="text-xl font-extrabold tracking-[0.22em] text-[#1A1A1A] uppercase">
                NAILS
              </span>
              <span className="text-[0.6rem] font-bold tracking-[0.32em] text-[#6B6B6B] -mt-1 uppercase">
                EXPRESS
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    setMobileOpen(false);
                    // Truco oculto: 10 clics seguidos en «Configuración»
                    // desbloquean la zona de mantenimiento (borrar datos de prueba).
                    try {
                      if (item.href === "/admin/configuracion") {
                        const n =
                          (parseInt(sessionStorage.getItem("nx_cfg_clicks") || "0", 10) || 0) + 1;
                        sessionStorage.setItem("nx_cfg_clicks", String(n));
                        if (n >= 10) {
                          sessionStorage.setItem("nx_maintenance", "1");
                          window.dispatchEvent(new Event("nx-show-maintenance"));
                        }
                      } else {
                        sessionStorage.setItem("nx_cfg_clicks", "0");
                      }
                    } catch {}
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#E6F6F4] text-primary font-semibold shadow-2xs"
                      : "text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-primary" : "text-[#8E8E8E]"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Actions */}
        <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {user.nombre.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#1A1A1A] truncate">
                {user.nombre}
              </p>
              <span className="inline-block text-[0.65rem] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                {user.rol}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold text-[#1A1A1A] bg-white border border-[#ECECEC] rounded-lg hover:bg-gray-100 transition-colors"
              title="Ver web pública"
            >
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
              <span>Ver Web</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}
    </>
  );
}
