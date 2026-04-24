"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  MapPin,
  Ticket,
  Bell,
  Settings,
  ExternalLink,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/markets", label: "Markets", icon: MapPin },
  { href: "/admin/lottery", label: "Lottery", icon: Ticket },
  { href: "/admin/alerts", label: "Alerts", icon: Bell },
  { href: "/admin/system", label: "System", icon: Settings },
];

interface AdminNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminNav({ isOpen = false, onClose }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-[rgba(0,0,0,0.08)] z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:z-30
        `}
      >
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--green)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-outfit font-bold text-lg text-[var(--ink)]">
              EACC Admin
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center gap-2 h-16 px-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-[var(--green)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="font-outfit font-bold text-lg text-[var(--ink)]">
            EACC Admin
          </span>
        </div>

        {/* Nav Items */}
        <div className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--green)] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-gray-100" />

        {/* Public Site Link */}
        <div className="p-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={18} />
            <span className="truncate">Public Dashboard</span>
          </Link>
        </div>

        {/* Version Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="px-3 py-2 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">EACC Admin</p>
            <p className="text-xs text-gray-500">v1.0.0 · {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </nav>
    </>
  );
}
