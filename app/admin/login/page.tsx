"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@nailsexpress.com");
  const [password, setPassword] = useState("admin123Nails!");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Credenciales incorrectas.");
      } else {
        toast.success(`Bienvenido/a, ${data.user.nombre}`);
        // Solo se permite redirigir a rutas internas del panel (anti open-redirect).
        const from = searchParams.get("from") || "";
        const redirect = /^\/admin(\/|$)/.test(from) ? from : "/admin";
        router.push(redirect);
        router.refresh();
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex flex-col items-center select-none group">
          <span className="text-3xl font-extrabold tracking-[0.22em] text-[#1A1A1A] group-hover:text-primary transition-colors uppercase">
            NAILS
          </span>
          <span className="text-xs font-bold tracking-[0.32em] text-[#6B6B6B] -mt-1 uppercase">
            EXPRESS
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-[#1A1A1A]">
          Panel de Administración
        </h2>
        <p className="mt-1 text-xs text-[#6B6B6B]">
          Ingresa con tu cuenta autorizada para gestionar la agenda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-[18px] border border-[#ECECEC] shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nailsexpress.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-[12px] border border-[#ECECEC] focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-[12px] border border-[#ECECEC] focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-colors"
                />
              </div>
            </div>

            {/* Quick Demo Credentials Info */}
            <div className="bg-[#FAF3F3] p-3 rounded-lg border border-[#F2DADA] text-xs text-[#6B6B6B] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Acceso semilla:</strong> <br />
                admin@nailsexpress.com / admin123Nails!
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm font-semibold justify-center shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-2 border-t border-gray-100">
            <Link
              href="/"
              className="text-xs text-[#6B6B6B] hover:text-primary transition-colors"
            >
              ← Volver a la web pública de Nails Express
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
