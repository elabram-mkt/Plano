"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  PlusSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  RefreshCw,
  X,
} from "lucide-react";
import { usePlano } from "@/lib/plano-context";
import { getPlatformIcon, getPlatformColorClasses } from "@/components/platform-visuals";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarPage() {
  const router = useRouter();
  const { posts, expandedPosts, channels, hasUsedAi, handleEditPost, handleSkipOccurrence, handleCreateOnDate, triggerNotification } =
    usePlano();

  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2026, 6, 14)); // Seed is set around July 2026

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfWeek(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const prevMonthDays = Array.from({ length: firstDayIndex }, (_, i) => {
    const dayNum = daysInPrevMonth - firstDayIndex + 1 + i;
    return {
      day: dayNum,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      dateString: `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
    };
  });

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    return {
      day: dayNum,
      month: month,
      year: year,
      isCurrentMonth: true,
      dateString: `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
    };
  });

  const totalCells = 42;
  const remainingCells = totalCells - (prevMonthDays.length + currentMonthDays.length);

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => {
    const dayNum = i + 1;
    return {
      day: dayNum,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      dateString: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`,
    };
  });

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 14));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 14));
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Calendar view header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-500" /> Editorial Calendar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View monthly queue structure. Click empty cells to schedule or select cards to edit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-200 px-3 w-32 text-center">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              const today = new Date();
              setCalendarDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
              triggerNotification("Navigated to today.", "info");
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-xs font-semibold transition"
          >
            Today
          </button>

          <button
            onClick={() => router.push("/compose")}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition"
          >
            <PlusSquare className="w-3.5 h-3.5" /> Compose
          </button>
        </div>
      </div>

      {/* Onboarding Checklist Card */}
      {(!channels.some((c) => c.connected) || posts.length === 0 || !hasUsedAi) && (
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/40 to-slate-950 border border-indigo-500/15 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Welcome to Plano Workspace
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Complete these quick setup tasks to launch your social media content powerhouse:
              </p>
            </div>
            <div className="text-[10px] text-slate-500 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/60 font-mono self-start md:self-auto">
              Onboarding Progress: {[channels.some((c) => c.connected), posts.length > 0, hasUsedAi].filter(Boolean).length}/3
              completed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
            {/* Step 1: Connect a channel */}
            {(() => {
              const isDone = channels.some((c) => c.connected);
              return (
                <div
                  onClick={() => router.push("/channels")}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                    isDone
                      ? "bg-emerald-950/15 border-emerald-500/20 text-emerald-300"
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700/60 text-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isDone ? "bg-emerald-500 border-emerald-400 text-slate-950" : "bg-slate-900 border-slate-700 text-slate-500"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-[10px] font-bold">1</span>}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-bold ${isDone ? "line-through text-emerald-400/80" : ""}`}>
                      Connect a channel
                    </span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">Integrate IG, Twitter, or LinkedIn</span>
                  </div>
                </div>
              );
            })()}

            {/* Step 2: Create your first post */}
            {(() => {
              const isDone = posts.length > 0;
              return (
                <div
                  onClick={() => router.push("/compose")}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                    isDone
                      ? "bg-emerald-950/15 border-emerald-500/20 text-emerald-300"
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700/60 text-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isDone ? "bg-emerald-500 border-emerald-400 text-slate-950" : "bg-slate-900 border-slate-700 text-slate-500"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-[10px] font-bold">2</span>}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-bold ${isDone ? "line-through text-emerald-400/80" : ""}`}>
                      Create your first post
                    </span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">Draft, schedule, or publish</span>
                  </div>
                </div>
              );
            })()}

            {/* Step 3: Try the AI assistant */}
            {(() => {
              const isDone = hasUsedAi;
              return (
                <div
                  onClick={() => router.push("/ai")}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                    isDone
                      ? "bg-emerald-950/15 border-emerald-500/20 text-emerald-300"
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700/60 text-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isDone ? "bg-emerald-500 border-emerald-400 text-slate-950" : "bg-slate-900 border-slate-700 text-slate-500"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-[10px] font-bold">3</span>}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-bold ${isDone ? "line-through text-emerald-400/80" : ""}`}>
                      Try the AI assistant
                    </span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">Generate hooks, captions, or plans</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="flex-1 min-h-[400px] bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">Your Editorial Calendar is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            There are no scheduled or drafted posts in this workspace. Create your first post to start mapping out your content
            schedule.
          </p>
          <button
            onClick={() => router.push("/compose")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition mt-6 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
          >
            <PlusSquare className="w-4 h-4" /> Create Your First Post
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex-1 flex flex-col">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-800/30 py-2.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div key={dayName} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                {dayName}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 grid-rows-6 flex-1 divide-x divide-y divide-slate-800/50">
            {allCalendarDays.map((cell, idx) => {
              const isToday = cell.year === 2026 && cell.month === 6 && cell.day === 14; // hardcode for today July 14, 2026

              // Find matching posts
              const cellPosts = expandedPosts.filter((post) => {
                const pDate = new Date(post.scheduledAt);
                return pDate.getFullYear() === cell.year && pDate.getMonth() === cell.month && pDate.getDate() === cell.day;
              });

              return (
                <div
                  key={`${cell.dateString}-${idx}`}
                  className={`min-h-[100px] p-2 flex flex-col justify-between group transition duration-150 hover:bg-slate-800/10 ${
                    cell.isCurrentMonth ? "bg-transparent" : "bg-slate-950/20 text-slate-600"
                  } ${isToday ? "bg-indigo-600/20 ring-1 ring-inset ring-indigo-500/50" : ""}`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[11px] font-semibold flex items-center justify-center w-5 h-5 rounded-full ${
                        isToday
                          ? "bg-indigo-600 text-white font-bold"
                          : cell.isCurrentMonth
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      {cell.day}
                    </span>

                    {/* Plus button visible on cell hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateOnDate(cell.dateString);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-indigo-500/20 rounded text-indigo-400 transition"
                      title="Schedule post on this day"
                    >
                      <PlusSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Cell Posts list */}
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[85px] scrollbar-thin">
                    {cellPosts.map((post) => {
                      const isGhost = post.isGhost;
                      return (
                        <div key={post.id} className="relative group/post">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPost(isGhost ? posts.find((p) => p.id === post.originalId)! : post);
                            }}
                            className={`w-full text-left text-[10px] p-1.5 rounded border flex flex-col gap-0.5 transition hover:scale-[1.02] cursor-pointer ${getPlatformColorClasses(
                              post.platforms[0] || "instagram"
                            )} ${
                              post.status === "draft"
                                ? "border-dashed border-slate-700/60 opacity-80"
                                : post.status === "pending_review"
                                ? "border-dotted border-amber-500/60 bg-amber-950/20 text-amber-200"
                                : post.status === "approved"
                                ? "border-emerald-500/40 bg-emerald-950/10 text-emerald-200"
                                : post.status === "published"
                                ? "border-opacity-50 brightness-75"
                                : ""
                            } ${isGhost ? "opacity-60 bg-slate-900/40" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 shrink-0 font-medium truncate max-w-[70%]">
                                {post.platforms.map((plat) => (
                                  <span key={plat}>{getPlatformIcon(plat)}</span>
                                ))}
                                {isGhost && <RefreshCw className="w-2.5 h-2.5 ml-0.5 text-slate-400" />}
                              </div>
                              <span className="text-[9px] opacity-75 shrink-0">
                                {new Date(post.scheduledAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })}
                              </span>
                            </div>
                            <span className="truncate text-[9px] opacity-90 leading-tight">
                              {post.isCustomized ? post.captions?.[post.platforms[0]] || "Customized captions" : post.caption}
                            </span>
                          </button>

                          {isGhost && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSkipOccurrence(post.originalId!, post.ghostDate!);
                              }}
                              className="absolute -top-1.5 -right-1.5 p-1 bg-slate-800 border border-slate-700 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 text-slate-400 rounded-full opacity-0 group-hover/post:opacity-100 transition shadow-lg"
                              title="Skip occurrence"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
