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
      <div className="w-[44px] h-[44px] bg-[var(--amber)] rounded-[12px] flex items-center justify-center mb-6">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C7 2 4 6 4 10c0 3 1 5 3 7l5 5 5-5c2-2 3-4 3-7 0-4-3-8-8-8z"
            fill="#111"
          />
          <path
            d="M12 6c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4z"
            fill="#EF9F27"
          />
        </svg>
      </div>

      {/* Navigation - 44×44 / radius 12 pill system */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-[44px] h-[44px] rounded-[12px] flex items-center justify-center transition-all ${
                isActive
                  ? "bg-[#EF9F27]"
                  : "bg-white hover:bg-gray-50"
              }`}
              title={item.label}
            >
              <Icon
                size={20}
                className="text-[#111]"
              />
            </Link>
          );
        })}
      </nav>

      {/* Voice Button - circular, intentional break from pill grid */}
      <button
        className="w-[44px] h-[44px] rounded-full bg-[#EF9F27] flex items-center justify-center hover:opacity-90 transition-opacity"
        title="Audio settings"
      >
        <Volume2 size={20} className="text-[#111]" />
      </button>
    </aside>
  );
}
