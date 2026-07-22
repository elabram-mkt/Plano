"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar as CalendarIcon,
  PlusSquare,
  Clock,
  Layers,
  Bot,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { LogoutButton } from "@/components/logout-button";

const NAV_ITEMS = [
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/compose", label: "Create Post", icon: PlusSquare },
  { href: "/queue", label: "Queue", icon: Clock },
  { href: "/channels", label: "Channels", icon: Layers },
  { href: "/ai", label: "AI Assistant", icon: Bot },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="w-full md:w-20 lg:w-60 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm flex flex-row md:flex-col justify-between p-4 md:py-6 md:px-3 lg:px-4 shrink-0 shadow-xl transition-all duration-300">
      <div className="flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start w-full gap-2 md:gap-8">
        {/* Logo Brand Header */}
        <div className="flex items-center md:justify-center lg:justify-start gap-3 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex flex-col md:hidden lg:flex">
            <span className="font-bold text-xl text-white leading-none tracking-tight">Plano</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-1">Scheduler</span>
          </div>
        </div>

        {/* Workspace Switcher */}
        <WorkspaceSwitcher />

        {/* Navigation Links */}
        <nav className="hidden md:flex flex-col gap-1.5 w-full">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`sidebar-nav-${item.href.slice(1)}`}
                className={`flex items-center md:justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent"
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span className="md:hidden lg:inline truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Quick Info */}
      <div className="hidden md:flex flex-col gap-3 pt-4 border-t border-slate-800">
        <div className="flex items-center md:justify-center lg:justify-between gap-2.5 px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-indigo-400 border border-slate-700 shrink-0">
              {(user?.email?.charAt(0) || "?").toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 md:hidden lg:flex">
              <span className="text-xs font-semibold text-slate-200 truncate">{user?.email || "Not signed in"}</span>
              <span className="text-[10px] text-slate-500">Free Tier</span>
            </div>
          </div>
          <div className="md:hidden lg:block">
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md py-2.5 px-4 flex items-center justify-around md:hidden shadow-2xl pb-safe">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const label = item.href === "/compose" ? "Create" : item.label;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-1 rounded-lg transition-all ${
              isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-medium tracking-tight leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
