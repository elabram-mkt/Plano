"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw } from "lucide-react";
import { PlanoProvider, usePlano } from "@/lib/plano-context";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { ToastStack } from "@/components/toast-stack";
import { NewWorkspaceModal } from "@/components/new-workspace-modal";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { mounted } = usePlano();
  const pathname = usePathname();
  const router = useRouter();

  // Global Keyboard Shortcut: "N" to open composer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in a text field, textarea, or contenteditable element
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/compose");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium tracking-wide">Initializing Plano SaaS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-200">
      <Sidebar />
      <MobileNav />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-0 relative">
        <ToastStack />
        <NewWorkspaceModal />

        <div className="p-4 md:p-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlanoProvider>
      <DashboardShell>{children}</DashboardShell>
    </PlanoProvider>
  );
}
