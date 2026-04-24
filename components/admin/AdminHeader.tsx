"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, ExternalLink, Menu } from "lucide-react";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAdmin: boolean;
  };
  onMenuClick?: () => void;
}

export function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[rgba(0,0,0,0.08)] z-40 lg:pl-64">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Mobile logo (visible on small screens only) */}
          <Link href="/admin" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[var(--green)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-outfit font-bold text-lg text-[var(--ink)]">
              EACC
            </span>
          </Link>

          {/* View Toggle (desktop only) */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:bg-white transition-colors"
            >
              <ExternalLink size={14} />
              Public
            </Link>
            <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-[var(--green)] shadow-sm">
              Admin
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 lg:gap-4 min-w-0">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#EAF3DE] rounded-full flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#3B6D11] animate-pulse" />
            <span className="text-xs font-medium text-[#3B6D11]">Online</span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 lg:gap-3 min-w-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={32}
                height={32}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--green)] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {user.name?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
            )}
            <div className="hidden md:block min-w-0">
              <p className="text-sm font-medium text-[var(--ink)] truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          {/* Sign Out */}
          <form action="/api/auth/signout" method="POST" className="flex-shrink-0">
            <button
              type="submit"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
