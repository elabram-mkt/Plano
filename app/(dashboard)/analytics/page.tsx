"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  BarChart3,
  PlusSquare,
  Globe,
  TrendingUp,
  Share2,
  Bot,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { usePlano } from "@/lib/plano-context";
import { PLATFORMS_CONFIG } from "@/lib/store";
import { getPlatformIcon, getPlatformBrandColor } from "@/components/platform-visuals";
import { ALL_PERFORMING_POSTS, getKPIs, getLineChartData, getBarChartData } from "@/lib/analytics-helpers";

export default function AnalyticsPage() {
  const router = useRouter();
  const { posts, markAiUsed, triggerNotification } = usePlano();

  const [analyticsDays, setAnalyticsDays] = useState<7 | 30 | 90>(30);
  const [analyticsPlatform, setAnalyticsPlatform] = useState<string>("all");
  const [aiInsights, setAiInsights] = useState<{
    insights: Array<{ title: string; description: string; platform: string; impact: string }>;
  } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchAIInsights = async () => {
    setLoadingInsights(true);
    setAiInsights(null);
    try {
      const kpis = getKPIs(analyticsDays, analyticsPlatform);
      const lineData = getLineChartData(analyticsDays, analyticsPlatform);
      const res = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analyticsSummary: {
            days: analyticsDays,
            platform: analyticsPlatform,
            kpis: kpis.map((k) => ({ label: k.label, value: k.value, diff: k.diff, isUp: k.isUp })),
            lineChartPeak: lineData.peakText,
          },
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to load insights.");
      }
      const data = await res.json();
      if (data && data.insights) {
        setAiInsights(data);
        triggerNotification("AI Insights generated successfully!", "success");
        markAiUsed();
      } else {
        throw new Error("Invalid format received.");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("AI generation failed. Please try again.", "error");
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Workspace Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Performance telemetry: aggregate impressions, platform engagement indices, and top-performing scheduled posts.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 self-start sm:self-center">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => {
                setAnalyticsDays(days);
                setAiInsights(null); // Reset stale insights when params change
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                analyticsDays === days ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex-1 min-h-[400px] bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center mt-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <BarChart3 className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">No Performance Telemetry Data</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
            Analytics require active publications or scheduled posts to map performance indices. Draft and publish content to
            unlock aggregate impressions, platform engagement insights, and AI Growth Intelligence!
          </p>
          <button
            onClick={() => router.push("/compose")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition mt-6 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
          >
            <PlusSquare className="w-4 h-4" /> Schedule Your First Post
          </button>
        </div>
      ) : (
        <>
          {/* Platform Filter Chips */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter by Platform</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setAnalyticsPlatform("all");
                  setAiInsights(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  analyticsPlatform === "all"
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                    : "bg-slate-900 border-slate-800/80 text-slate-400 hover:bg-slate-800/60"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                All Platforms
              </button>
              {Object.keys(PLATFORMS_CONFIG).map((pId) => {
                const isSelected = analyticsPlatform === pId;
                return (
                  <button
                    key={pId}
                    onClick={() => {
                      setAnalyticsPlatform(pId);
                      setAiInsights(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                        : "bg-slate-900 border-slate-800/80 text-slate-400 hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="scale-90">{getPlatformIcon(pId)}</span>
                    {PLATFORMS_CONFIG[pId]?.name || pId}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary Metric KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getKPIs(analyticsDays, analyticsPlatform).map((stat, idx) => (
              <div
                key={idx}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2 shadow-md hover:scale-[1.01] transition duration-200"
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <div className="flex items-baseline justify-between mt-1 gap-2 flex-wrap">
                  <span className="text-xl font-bold text-white tracking-tight">{stat.value}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                      stat.isUp
                        ? "text-emerald-400 bg-emerald-950/20 border border-emerald-500/20"
                        : "text-rose-400 bg-rose-950/20 border border-rose-500/20"
                    }`}
                  >
                    <span>{stat.isUp ? "▲" : "▼"}</span>
                    <span>{stat.diff}</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">{stat.desc}</span>
              </div>
            ))}
          </div>

          {/* Grid of Dynamic SVG Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dynamic Line Chart */}
            {(() => {
              const chartData = getLineChartData(analyticsDays, analyticsPlatform);
              return (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Impressions (Last {analyticsDays} Days)
                      </h2>
                      <p className="text-[10px] text-slate-500 capitalize">
                        Performance tracking for {analyticsPlatform === "all" ? "All Platforms" : analyticsPlatform}
                      </p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                  </div>

                  {/* SVG Line Drawing */}
                  <div className="w-full h-48 bg-slate-950/40 rounded-xl border border-slate-800/80 p-2 relative flex items-center justify-center">
                    <svg viewBox="0 0 300 120" className="w-full h-full">
                      <defs>
                        <linearGradient id="areaGradientDynamic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
                      <line x1="0" y1="60" x2="300" y2="60" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />
                      <line x1="0" y1="100" x2="300" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3" />

                      {/* Filled Area */}
                      <path d={chartData.areaPath} fill="url(#areaGradientDynamic)" />

                      {/* Stroke Path */}
                      <path d={chartData.strokePath} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />

                      {/* Dynamic Interactive dots */}
                      {chartData.dots.map((dot, dIdx) => (
                        <g key={dIdx} className="group cursor-pointer">
                          <circle
                            cx={dot.cx}
                            cy={dot.cy}
                            r="4"
                            fill="#6366f1"
                            className="transition-all duration-200 hover:r-6 hover:fill-white"
                          />
                          <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <rect
                              x={dot.cx - 35}
                              y={dot.cy - 22}
                              width="70"
                              height="14"
                              rx="3"
                              fill="#0f172a"
                              stroke="#334155"
                              strokeWidth="1"
                            />
                            <text
                              x={dot.cx}
                              y={dot.cy - 12}
                              fill="#f8fafc"
                              fontSize="6"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              {dot.tooltip}
                            </text>
                          </g>
                        </g>
                      ))}
                    </svg>

                    {/* Floating tooltip summary */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 rounded px-2.5 py-0.5 text-[8px] font-mono text-slate-300 shadow-lg">
                      {chartData.peakText}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SVG Bar Chart with platforms highlight */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Engagement Rate Per Platform</h2>
                  <p className="text-[10px] text-slate-500">Average interactions during {analyticsDays}-day period</p>
                </div>
                <Share2 className="w-4 h-4 text-purple-400" />
              </div>

              {/* SVG Bar Drawing */}
              <div className="w-full h-48 bg-slate-950/40 rounded-xl border border-slate-800/80 p-2 relative flex items-center justify-center">
                <svg viewBox="0 0 300 120" className="w-full h-full">
                  {/* Y-Axis Line */}
                  <line x1="30" y1="10" x2="30" y2="105" stroke="#1e293b" strokeWidth="1" />
                  {/* X-Axis Line */}
                  <line x1="30" y1="105" x2="290" y2="105" stroke="#1e293b" strokeWidth="1" />

                  {/* Bars */}
                  {getBarChartData(analyticsDays, analyticsPlatform).map((bar, idx) => {
                    const xOffset = 45 + idx * 40;
                    const height = bar.height;
                    const yOffset = 105 - height;
                    return (
                      <g key={bar.name} style={{ opacity: bar.opacity }} className="transition-opacity duration-300">
                        <rect
                          x={xOffset}
                          y={yOffset}
                          width="20"
                          height={height}
                          fill={bar.color}
                          rx="2"
                          className="transition duration-300 hover:brightness-110 cursor-pointer"
                        />
                        <text x={xOffset + 10} y={yOffset - 4} fill="#94a3b8" fontSize="6" textAnchor="middle">
                          {bar.textVal}
                        </text>
                        <text x={xOffset + 10} y="115" fill="#64748b" fontSize="6" textAnchor="middle">
                          {bar.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* AI Insights Button and Generated Cards Panel */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-400" /> AI Growth Intelligence
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Leverage Gemini to parse your current analytics scope ({analyticsDays} days,{" "}
                  {analyticsPlatform === "all" ? "all channels" : analyticsPlatform}) and draft tailored tactics.
                </p>
              </div>
              <button
                onClick={fetchAIInsights}
                disabled={loadingInsights}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:text-indigo-400 text-white font-semibold py-2.5 px-4 rounded-xl transition flex items-center gap-2 text-xs shrink-0 self-start sm:self-center shadow-lg shadow-indigo-600/10"
              >
                {loadingInsights ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {loadingInsights ? "Synthesizing Insights..." : "Generate AI Insights"}
              </button>
            </div>

            {/* Loader State with reassurance */}
            {loadingInsights && (
              <div className="py-8 flex flex-col items-center justify-center gap-3 bg-slate-950/30 rounded-xl border border-slate-800/50">
                <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                <span className="text-xs text-slate-300 font-medium">Analyzing dataset...</span>
                <span className="text-[10px] text-slate-500 max-w-sm text-center">
                  Gemini is formulating actionable audience-building strategies based on your engagement matrices.
                </span>
              </div>
            )}

            {/* AI Insights Card Deck */}
            {aiInsights && aiInsights.insights && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
              >
                {aiInsights.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-md hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/40 border border-indigo-900/60 px-2 py-0.5 rounded">
                        {insight.platform}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          insight.impact.toLowerCase().includes("high")
                            ? "text-emerald-400 bg-emerald-950/40 border border-emerald-900/60"
                            : "text-purple-400 bg-purple-950/40 border border-purple-900/60"
                        }`}
                      >
                        {insight.impact}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-tight">{insight.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Top 5 Performing Posts Table */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Performing Posts ({analyticsPlatform === "all" ? "All Channels" : analyticsPlatform})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold">
                    <th className="pb-2.5 font-bold">Platform</th>
                    <th className="pb-2.5 font-bold">Caption Copy Summary</th>
                    <th className="pb-2.5 text-right font-bold">Impressions</th>
                    <th className="pb-2.5 text-right font-bold">Clicks</th>
                    <th className="pb-2.5 text-right font-bold">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {(analyticsPlatform === "all"
                    ? ALL_PERFORMING_POSTS
                    : ALL_PERFORMING_POSTS.filter((post) =>
                        post.platforms.map((p) => p.toLowerCase()).includes(analyticsPlatform.toLowerCase())
                      )
                  )
                    .slice(0, 5)
                    .map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20">
                        <td className="py-2.5 font-medium flex items-center gap-1">
                          {row.platforms.map((p) => (
                            <span
                              key={p}
                              className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0 scale-90"
                              style={{ backgroundColor: getPlatformBrandColor(p) }}
                            >
                              {getPlatformIcon(p)}
                            </span>
                          ))}
                        </td>
                        <td className="py-2.5 pr-4 truncate max-w-[200px]">{row.caption}</td>
                        <td className="py-2.5 text-right font-mono text-slate-200">{row.imp}</td>
                        <td className="py-2.5 text-right font-mono text-slate-200">{row.clicks}</td>
                        <td className="py-2.5 text-right font-mono text-indigo-400 font-bold">{row.eng}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
