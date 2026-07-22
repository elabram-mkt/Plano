"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Check } from "lucide-react";
import { usePlano } from "@/lib/plano-context";

const WORKSPACE_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#f43f5e", // Rose
];

export function NewWorkspaceModal() {
  const { isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen, handleCreateWorkspace, workspaces } = usePlano();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceColor, setNewWorkspaceColor] = useState("#6366f1");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    handleCreateWorkspace(newWorkspaceName, newWorkspaceColor);
    setNewWorkspaceName("");
    const nextColorIdx = (workspaces.length + 1) % WORKSPACE_COLORS.length;
    setNewWorkspaceColor(WORKSPACE_COLORS[nextColorIdx]);
  };

  return (
    <AnimatePresence>
      {isNewWorkspaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setIsNewWorkspaceModalOpen(false)}
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Create New Workspace
              </h3>
              <button
                type="button"
                onClick={() => setIsNewWorkspaceModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g. My Workspace, Client B"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 transition outline-none"
                />
              </div>

              {/* Colors Grid */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Brand Color Accent
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {WORKSPACE_COLORS.map((color) => {
                    const isSelected = newWorkspaceColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewWorkspaceColor(color)}
                        className={`w-7 h-7 rounded-lg transition-all duration-200 border-2 cursor-pointer relative ${
                          isSelected
                            ? "border-white scale-110 shadow-lg shadow-indigo-500/10"
                            : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-800/60 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsNewWorkspaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
