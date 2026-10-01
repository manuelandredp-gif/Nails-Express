import React from "react";
import { requireSession } from "@/lib/auth";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const session = await requireSession();

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
          Mi cuenta
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
          {session.nombre} · {session.email}
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
