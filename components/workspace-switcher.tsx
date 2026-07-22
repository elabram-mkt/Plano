"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Check, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface WorkspaceMemberRow {
  workspace: Workspace | Workspace[] | null;
}

export function WorkspaceSwitcher() {
  const { user } = useUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const supabase = createClient();
    supabase
      .from("workspace_members")
      .select("workspace:workspaces(id, name, slug, plan)")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Failed to load workspaces:", error);
          setWorkspaces([]);
          setLoading(false);
          return;
        }

        const rows = (data ?? []) as unknown as WorkspaceMemberRow[];
        const loaded = rows
          .map((row) => (Array.isArray(row.workspace) ? row.workspace[0] : row.workspace))
          .filter((ws): ws is Workspace => Boolean(ws));

        setWorkspaces(loaded);
        setCurrentWorkspaceId((prev) => prev ?? loaded[0]?.id ?? null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  return (
    <div className="relative w-auto md:w-full md:px-0 lg:px-2" id="workspace-switcher-container">
      <button
        id="workspace-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || workspaces.length === 0}
        className="flex items-center justify-between md:justify-center lg:justify-between w-auto md:w-full gap-2.5 px-3 py-2 bg-slate-950/40 hover:bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl transition-all duration-200 text-left cursor-pointer group shadow-lg disabled:cursor-default disabled:hover:bg-slate-950/40"
      >
        <div className="flex items-center gap-2 min-w-0">
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-[10px] font-extrabold text-white uppercase shrink-0 select-none shadow-md">
              {currentWorkspace?.name?.charAt(0) || "W"}
            </div>
          )}
          <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors truncate md:hidden lg:inline">
            {loading ? "Loading..." : currentWorkspace?.name || "No workspace"}
          </span>
        </div>
        {!loading && workspaces.length > 0 && (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0 md:hidden lg:block" />
        )}
      </button>

      {isOpen && workspaces.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 md:left-2 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-2.5 py-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Workspaces</span>
            </div>

            {workspaces.map((ws) => {
              const isSelected = ws.id === currentWorkspaceId;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspaceId(ws.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full gap-2 px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/10"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-[10px] font-extrabold text-white uppercase shrink-0">
                      {ws.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium truncate">{ws.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
