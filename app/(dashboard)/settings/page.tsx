"use client";

import React from "react";
import { Settings as SettingsIcon, RefreshCw, CheckCircle2 } from "lucide-react";
import { usePlano } from "@/lib/plano-context";
import { getStoredPosts, getStoredChannels, resetToDefaults, saveChatHistory, getDefaultChatHistory } from "@/lib/store";

export default function SettingsPage() {
  const {
    approvalFlowEnabled,
    toggleApprovalFlow,
    updatePostsInStorage,
    updateChannelsInStorage,
    triggerNotification,
  } = usePlano();

  const handleResetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all posts, connected accounts, and chat logs back to the default state?"
      )
    ) {
      resetToDefaults();
      updatePostsInStorage(getStoredPosts());
      updateChannelsInStorage(getStoredChannels());
      saveChatHistory(getDefaultChatHistory());
      triggerNotification("Application data reset successfully.", "success");
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-500" /> Account Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure user profiles, calendar display timezones, and restore application factory parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column Profile config */}
        <div className="md:col-span-2 flex flex-col gap-5">
          {/* User Profile details */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">User Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500">First Name</span>
                <input
                  type="text"
                  defaultValue="Aulia"
                  disabled
                  className="p-2 bg-slate-950 rounded-lg text-xs text-slate-500 border border-slate-800/80 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500">Last Name</span>
                <input
                  type="text"
                  defaultValue="Rahman"
                  disabled
                  className="p-2 bg-slate-950 rounded-lg text-xs text-slate-500 border border-slate-800/80 cursor-not-allowed"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500">Email Address</span>
                <input
                  type="email"
                  defaultValue="aulia.r@elabram.com"
                  disabled
                  className="p-2 bg-slate-950 rounded-lg text-xs text-slate-500 border border-slate-800/80 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Timezone and preferences */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Workspace Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500">Timezone</span>
                <select className="p-2 bg-slate-950 rounded-lg text-xs text-slate-300 border border-slate-800">
                  <option>UTC-07:00 (Pacific Time)</option>
                  <option>UTC+00:00 (GMT)</option>
                  <option>UTC+07:00 (Jakarta/Bangkok)</option>
                  <option>UTC+08:00 (Singapore/Kuala Lumpur)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500">Week Starts On</span>
                <select className="p-2 bg-slate-950 rounded-lg text-xs text-slate-300 border border-slate-800">
                  <option>Sunday</option>
                  <option>Monday</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl mt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-white">Content Approval Flow</span>
                  <span className="text-[10px] text-slate-400">Require drafts to be approved before they can be scheduled.</span>
                </div>
                <button
                  id="toggle-approval-flow"
                  type="button"
                  onClick={toggleApprovalFlow}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    approvalFlowEnabled ? "bg-indigo-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      approvalFlowEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column destructive actions */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400">Database Tools</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reset the workspace to restore default connected accounts, 6 seed posts, and empty AI chat histories.
            </p>
            <button
              onClick={handleResetData}
              className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Restore Default Seeds
            </button>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">API Connection</h2>
            <div className="text-[10px] text-slate-500 flex flex-col gap-1">
              <p>Gemini API Status:</p>
              <p className="font-semibold text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active (Environment Key)
              </p>
              <p className="mt-1 leading-normal">All chatbot queries are proxy-routed through our server-side integration.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
