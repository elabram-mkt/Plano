"use client";

import React from "react";
import { Layers } from "lucide-react";
import { usePlano } from "@/lib/plano-context";
import { PLATFORMS_CONFIG } from "@/lib/store";
import { getPlatformIcon, getPlatformBrandColor } from "@/components/platform-visuals";

export default function ChannelsPage() {
  const { channels, handleToggleChannel } = usePlano();

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" /> Social Channels
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage linked accounts. Only connected channels are available inside the content composer.
        </p>
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {channels.map((chan) => {
          const limitInfo = PLATFORMS_CONFIG[chan.id];
          return (
            <div
              key={chan.id}
              className={`bg-slate-900/40 border rounded-2xl p-6 flex flex-col gap-4 justify-between transition shadow-md ${
                chan.connected ? "border-slate-800" : "border-slate-800/40 opacity-65"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/5"
                    style={{ backgroundColor: getPlatformBrandColor(chan.id) }}
                  >
                    {getPlatformIcon(chan.id)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{chan.name}</span>
                    <span className="text-xs text-slate-500">{chan.handle}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    chan.connected
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                      : "bg-slate-950 text-slate-600 border border-slate-900"
                  }`}
                >
                  {chan.connected ? "Active" : "Offline"}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 leading-normal pt-2 border-t border-slate-900">
                <div className="flex justify-between py-0.5">
                  <span>Character Limit:</span>
                  <span className="font-mono text-slate-300">{limitInfo.limit} chars</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Post Format:</span>
                  <span className="text-slate-300">Images, Video, Text</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleToggleChannel(chan.id)}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold border transition ${
                    chan.connected
                      ? "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-500/10"
                  }`}
                >
                  {chan.connected ? "Disconnect" : "Connect Channel"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
