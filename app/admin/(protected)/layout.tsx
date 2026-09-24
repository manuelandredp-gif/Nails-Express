import React from "react";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#FDFBFB] flex">
      {/* Sidebar */}
      <AdminSidebar user={session} />

      {/* Main Admin Content Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
