"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { usePlano } from "@/lib/plano-context";

export function ToastStack() {
  const { toasts } = usePlano();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className="pointer-events-auto"
          >
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 shadow-2xl backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-emerald-950/95 text-emerald-200 border-emerald-500/20"
                  : toast.type === "error"
                  ? "bg-rose-950/95 text-rose-200 border-rose-500/20"
                  : "bg-slate-900/95 text-slate-200 border-slate-800"
              }`}
            >
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === "info" && <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />}
              <p className="text-xs font-semibold leading-normal">{toast.text}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
