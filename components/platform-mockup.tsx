"use client";

import React, { useState } from "react";
import { Globe, Heart, MessageCircle, Bookmark, Send, MoreHorizontal, RefreshCw, ThumbsUp, MessageSquare, Eye, Share2, X, Instagram } from "lucide-react";
import { PLATFORMS_CONFIG } from "@/lib/store";
import { renderFormattedText } from "./platform-visuals";

interface PlatformMockupProps {
  platId: string;
  caption: string;
  captions: Record<string, string>;
  isCustomized: boolean;
  media: string | null;
  scheduledAt: string;
}

export function PlatformMockup({ platId, caption, captions, isCustomized, media, scheduledAt }: PlatformMockupProps) {
  const [isLinkedInCollapsed, setIsLinkedInCollapsed] = useState(true);
  const currentCaption = isCustomized ? captions[platId] || "" : caption;

  switch (platId) {
    case "instagram": {
      return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col text-slate-200">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Instagram story style border */}
              <div className="p-[1.5px] bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 rounded-full shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center border border-slate-900 text-[10px] font-bold text-white">
                  EA
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">elabram</span>
                  <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[7px] text-white flex items-center justify-center">✓</span>
                </div>
                <span className="text-[10px] text-slate-400">Singapore</span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white transition">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Media square */}
          <div className="w-full aspect-square bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800/40">
            {media ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media} alt="Instagram preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2.5 text-slate-600 p-4 text-center">
                <Instagram className="w-10 h-10 text-slate-800" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">No Image Uploaded</span>
                <span className="text-[9px] text-slate-600 max-w-[180px]">Upload or generate a photo to preview here</span>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <button className="text-slate-300 hover:text-rose-500 hover:scale-110 transition duration-150">
                <Heart className="w-5 h-5" />
              </button>
              <button className="text-slate-300 hover:text-indigo-400 hover:scale-110 transition duration-150">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="text-slate-300 hover:text-indigo-400 hover:scale-110 transition duration-150">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <button className="text-slate-300 hover:text-yellow-500 transition duration-150">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          {/* Likes */}
          <div className="px-3.5 py-1 text-xs font-bold text-slate-200">
            Liked by alex_doe and 1,428 others
          </div>

          {/* Caption & Comments */}
          <div className="px-3.5 pb-3 flex-1 flex flex-col justify-between">
            <div className="text-xs leading-relaxed text-slate-200">
              <span className="font-bold text-white mr-1.5">elabram</span>
              {renderFormattedText(currentCaption, "text-indigo-400")}
            </div>

            <div className="mt-4 flex flex-col gap-1 border-t border-slate-900/60 pt-2.5">
              <span className="text-[10.5px] text-slate-400 font-semibold cursor-pointer hover:text-slate-300">View all 12 comments</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">2 hours ago</span>
            </div>
          </div>
        </div>
      );
    }

    case "x": {
      return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col text-slate-200">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3 min-w-0">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0 border border-slate-700">
                EA
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14px] text-white truncate leading-tight">Plano</span>
                  <span className="w-3.5 h-3.5 bg-sky-500 rounded-full flex items-center justify-center text-[7px] text-white font-bold shrink-0">✓</span>
                  <span className="text-xs text-slate-500 truncate leading-tight">@elabram</span>
                  <span className="text-xs text-slate-500 shrink-0 leading-tight">· 2h</span>
                </div>
                {/* Content Tweet */}
                <div className="text-[14px] text-slate-100 leading-normal whitespace-pre-wrap mt-1">
                  {renderFormattedText(currentCaption, "text-[#1d9bf0]")}
                </div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white transition shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Media Image */}
          {media && (
            <div className="ml-13 rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 mt-2.5 max-h-[280px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media} alt="X preview" className="w-full h-full object-cover max-h-[280px]" />
            </div>
          )}

          {/* Action Bar (Standard Twitter Stats row) */}
          <div className="ml-13 mt-3.5 pt-2 border-t border-slate-800/40 flex items-center justify-between text-slate-500 text-xs max-w-md">
            <button className="flex items-center gap-1.5 hover:text-sky-400 group transition">
              <span className="p-1.5 group-hover:bg-sky-500/10 rounded-full transition">
                <MessageCircle className="w-4 h-4" />
              </span>
              <span>24</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-emerald-400 group transition">
              <span className="p-1.5 group-hover:bg-emerald-500/10 rounded-full transition">
                <RefreshCw className="w-4 h-4" />
              </span>
              <span>86</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-rose-500 group transition">
              <span className="p-1.5 group-hover:bg-rose-500/10 rounded-full transition">
                <Heart className="w-4 h-4" />
              </span>
              <span>512</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-sky-400 group transition">
              <span className="p-1.5 group-hover:bg-sky-500/10 rounded-full transition">
                <Eye className="w-4 h-4" />
              </span>
              <span>12k</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-sky-400 group transition">
              <span className="p-1.5 group-hover:bg-sky-500/10 rounded-full transition">
                <Send className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      );
    }

    case "linkedin": {
      // LinkedIn truncates caption after 3 lines (approx 150 characters)
      const shouldTruncate = currentCaption.length > 150;
      const truncatedText = shouldTruncate && isLinkedInCollapsed ? currentCaption.slice(0, 150) : currentCaption;

      return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl flex flex-col text-slate-200">
          {/* Header */}
          <div className="p-4 flex items-start justify-between gap-3">
            <div className="flex gap-3 min-w-0">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0 border border-slate-700">
                EA
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[14px] text-white truncate hover:underline cursor-pointer">Plano</span>
                  <span className="text-[11px] text-slate-400 font-normal">· @elabram</span>
                </div>
                <span className="text-[11px] text-slate-400 truncate max-w-[220px]">Social Media Manager at Plano Inc.</span>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                  <span>1h</span>
                  <span>•</span>
                  <Globe className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white transition">
              <MoreHorizontal className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Caption area */}
          <div className="px-4 pb-2.5 text-xs leading-relaxed text-slate-200">
            {renderFormattedText(truncatedText, "text-[#0a66c2]")}
            {shouldTruncate && isLinkedInCollapsed && (
              <button
                onClick={() => setIsLinkedInCollapsed(false)}
                className="text-[#0a66c2] font-semibold hover:underline cursor-pointer ml-1.5 inline-block focus:outline-none animate-pulse"
              >
                ...see more
              </button>
            )}
            {shouldTruncate && !isLinkedInCollapsed && (
              <button
                onClick={() => setIsLinkedInCollapsed(true)}
                className="text-[#0a66c2] font-semibold hover:underline cursor-pointer ml-1.5 inline-block focus:outline-none"
              >
                (show less)
              </button>
            )}
          </div>

          {/* Media Image */}
          {media ? (
            <div className="w-full border-t border-b border-slate-800/80 bg-slate-950 max-h-[300px] overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media} alt="LinkedIn preview" className="w-full object-cover max-h-[300px]" />
            </div>
          ) : null}

          {/* Reactions bar */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800/40 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[7px] text-white font-bold border border-slate-900">👍</div>
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[7px] text-white font-bold border border-slate-900">❤️</div>
                <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[7px] text-white font-bold border border-slate-900">👏</div>
              </div>
              <span>elabram and 48 others</span>
            </div>
            <span className="hover:underline cursor-pointer">5 comments • 1 repost</span>
          </div>

          {/* Action Row Buttons */}
          <div className="px-2 py-1 flex items-center justify-between">
            <button className="flex-1 py-2 flex items-center justify-center gap-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
              <ThumbsUp className="w-4 h-4 text-slate-400" />
              <span>Like</span>
            </button>
            <button className="flex-1 py-2 flex items-center justify-center gap-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Comment</span>
            </button>
            <button className="flex-1 py-2 flex items-center justify-center gap-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>Repost</span>
            </button>
            <button className="flex-1 py-2 flex items-center justify-center gap-1.5 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
              <Send className="w-4 h-4 text-slate-400" />
              <span>Send</span>
            </button>
          </div>
        </div>
      );
    }

    case "facebook": {
      return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl flex flex-col text-slate-200">
          {/* Header */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0 border border-slate-700">
                EA
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[14px] text-white leading-tight hover:underline cursor-pointer">Plano App</span>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                  <span>Sponsored</span>
                  <span>·</span>
                  <Globe className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <button className="hover:text-white transition"><MoreHorizontal className="w-4.5 h-4.5" /></button>
              <button className="hover:text-white transition"><X className="w-4.5 h-4.5" /></button>
            </div>
          </div>

          {/* Caption */}
          <div className="px-4 pb-3 text-xs leading-relaxed text-slate-200">
            {renderFormattedText(currentCaption, "text-indigo-400")}
          </div>

          {/* Media Image */}
          {media ? (
            <div className="w-full border-t border-b border-slate-800/80 bg-slate-950 max-h-[300px] overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media} alt="Facebook preview" className="w-full object-cover max-h-[300px]" />
            </div>
          ) : null}

          {/* Likes and Comment count */}
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800/40 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                <div className="w-4.5 h-4.5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold border border-slate-900 shadow font-normal">👍</div>
                <div className="w-4.5 h-4.5 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white font-bold border border-slate-900 shadow font-normal">❤️</div>
              </div>
              <span>128</span>
            </div>
            <span className="hover:underline cursor-pointer">14 comments • 3 shares</span>
          </div>

          {/* Actions Bar */}
          <div className="px-2 py-1 flex items-center justify-between">
            <button className="flex-1 py-2.5 flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
              <ThumbsUp className="w-4 h-4 text-slate-400" />
              <span>Like</span>
            </button>
            <button className="flex-1 py-2.5 flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Comment</span>
            </button>
            <button className="flex-1 py-2.5 flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-800/50 rounded-lg text-xs font-bold transition">
              <Share2 className="w-4 h-4 text-slate-400" />
              <span>Share</span>
            </button>
          </div>
        </div>
      );
    }

    default: {
      const config = PLATFORMS_CONFIG[platId] || { name: platId, handle: `@${platId}_user` };
      return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-slate-200">
          {/* Header */}
          <div className="p-4 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0 border border-slate-700">
                EA
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{config.name} Preview</span>
                <span className="text-[10px] text-slate-500">@elabram</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">mock feed</span>
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col gap-3">
            <div className="text-xs leading-relaxed text-slate-100">
              {renderFormattedText(currentCaption, "text-indigo-400")}
            </div>

            {media && (
              <div className="rounded-lg overflow-hidden border border-slate-800/60 bg-slate-950 max-h-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media} alt="Feed preview" className="w-full object-cover max-h-[220px]" />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-950/20 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-medium">Scheduled for: {new Date(scheduledAt).toLocaleString()}</span>
            <span className="text-[10px] font-mono">{currentCaption.length} chars</span>
          </div>
        </div>
      );
    }
  }
}
