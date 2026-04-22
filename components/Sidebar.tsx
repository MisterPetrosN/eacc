"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Trophy,
  Ticket,
  TrendingUp,
  Volume2,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/me", icon: User, label: "My Stats" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/lottery", icon: Ticket, label: "Lottery" },
  { href: "/spread", icon: TrendingUp, label: "Spread" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-[68px] bg-[var(--green)] flex-col items-center py-4 z-50">
      {/* Logo */}
      <div className="w-[42px] h-[42px] bg-[var(--amber)] rounded-[11px] flex items-center justify-center mb-6">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C7 2 4 6 4 10c0 3 1 5 3 7l5 5 5-5c2-2 3-4 3-7 0-4-3-8-8-8z"
            fill="var(--ink)"
          />
          <path
            d="M12 6c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4z"
            fill="var(--amber)"
          />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
              title={item.label}
            >
              <Icon
                size={20}
                className={isActive ? "text-white" : "text-white/45"}
              />
            </Link>
          );
        })}
      </nav>

      {/* Audio Button */}
      <button
        className="w-10 h-10 rounded-full bg-[var(--amber)] flex items-center justify-center hover:opacity-90 transition-opacity"
        title="Audio settings"
      >
        <Volume2 size={18} className="text-[var(--ink)]" />
      </button>
    </aside>
  );
}
