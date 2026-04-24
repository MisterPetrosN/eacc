"use client";

import { useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminHeader } from "@/components/admin/AdminHeader";

// Mock user for development when not logged in
const mockUser = {
  name: "Dev User",
  email: "dev@example.com",
  image: null,
  isAdmin: true,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EDE4D3]">
      {/* Admin Sidebar Nav */}
      <AdminNav
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Admin Header */}
      <AdminHeader
        user={mockUser}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Main Content - offset for sidebar on desktop */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
