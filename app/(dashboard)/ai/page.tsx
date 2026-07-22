"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Sparkles, RefreshCw, ChevronRight, CalendarIcon, PlusSquare } from "lucide-react";
import { usePlano } from "@/lib/plano-context";
import { Post, PLATFORMS_CONFIG, generateId, getChatHistory, saveChatHistory, getDefaultChatHistory } from "@/lib/store";
import { getPlatformIcon } from "@/components/platform-visuals";

const CHAT_SUGGESTIONS = [
  {
    label: "Tech Startup Hook",
    prompt: "Give me 3 high-converting hooks for a Twitter/X thread launching a productivity SaaS.",
  },
  {
    label: "LinkedIn Post Blueprint",
    prompt: "Structure an editorial LinkedIn post discussing why 'building in public' builds massive trust.",
  },
  {
    label: "Instagram Caption Ideas",
    prompt: "Generate a witty, short Instagram caption with hashtags for a scenic office picture.",
  },
  {
    label: "Optimize Engagement",
    prompt: "What are the best peak posting times on Instagram, LinkedIn, and TikTok in 2026?",
  },
];

type GeneratedPlanPost = {
  day: number;
  date: string;
  platform: string;
  contentPillar: string;
  postIdea: string;
  caption: string;
};

export default function AiAssistantPage() {
  const { posts, updatePostsInStorage, markAiUsed, triggerNotification } = usePlano();
  const searchParams = useSearchParams();

  const [assistantTab, setAssistantTab] = useState<"chat" | "plan">("chat");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [planBusinessDesc, setPlanBusinessDesc] = useState("");
  const [planAudience, setPlanAudience] = useState("");
  const [planFrequency, setPlanFrequency] = useState("3x/week");
  const [planLanguage, setPlanLanguage] = useState("English");
  const [planPlatforms, setPlanPlatforms] = useState<string[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanPost[]>([]);

  // Load persisted chat history on mount
  useEffect(() => {
    const stored = getChatHistory();
    if (stored) {
      setChatMessages(stored);
    } else {
      const defaults = getDefaultChatHistory();
      setChatMessages(defaults);
      saveChatHistory(defaults);
    }
  }, []);

  // Prefill the chat input when arriving from Composer's "Enhance with Plano AI"
  useEffect(() => {
    const draft = searchParams.get("draft");
    if (draft) setChatInput(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSendChat = async (overridePrompt?: string) => {
    const promptToSend = (overridePrompt || chatInput).trim();
    if (!promptToSend) return;

    const userMsg = { role: "user" as const, content: promptToSend };
    const updatedMessages = [...chatMessages, userMsg];

    setChatMessages(updatedMessages);
    setChatInput("");
    setIsGenerating(true);

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response");
      }

      const data = await response.json();
      const aiResponseText = data.response;

      const aiMsg = { role: "assistant" as const, content: aiResponseText };
      const finalMessages = [...updatedMessages, aiMsg];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);
      markAiUsed();
    } catch (error) {
      console.error(error);
      const errorMsg = {
        role: "assistant" as const,
        content:
          "Sorry, I had trouble reaching Plano AI. Please ensure your Gemini API Key is configured in Settings > Secrets.",
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleGeneratePlan = async () => {
    if (!planBusinessDesc.trim() || !planAudience.trim() || planPlatforms.length === 0) {
      triggerNotification("Please fill in business description, target audience, and select at least one platform.", "error");
      return;
    }

    setIsGeneratingPlan(true);
    setGeneratedPlan([]);

    const prompt = `You are an expert social media manager. Create a 30-day content plan for a business based on these details:
Business Description: ${planBusinessDesc}
Target Audience: ${planAudience}
Posting Frequency: ${planFrequency}
Language: ${planLanguage}
Target Platforms: ${planPlatforms.join(", ")}

Generate a strict JSON array of objects representing the content plan.
EACH object in the array must have the following fields:
- "day": a number from 1 to 30.
- "date": string representing the day, e.g., "Day 1".
- "platform": the social media platform string.
- "contentPillar": one of "Value", "Engagement", "Credibility", "Promotion".
- "postIdea": a one-sentence summary of the post idea.
- "caption": the full, ready-to-post caption including hashtags.

Only generate posts for the specified frequency (e.g., if 3x/week, you should generate roughly 12-13 posts, not 30).
Return ONLY the JSON array. Do not include markdown formatting or code blocks.`;

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) throw new Error("Failed to generate content plan.");

      const data = await response.json();
      let text = data.response.trim();
      if (text.startsWith("```json")) text = text.slice(7, -3);
      else if (text.startsWith("```")) text = text.slice(3, -3);

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setGeneratedPlan(parsed);
        triggerNotification("Content plan generated successfully.", "success");
        markAiUsed();
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("AI generation failed. Please try again.", "error");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const addPlanPostToCalendar = (post: GeneratedPlanPost) => {
    const today = new Date();
    today.setDate(today.getDate() + (post.day - 1));
    const targetDate = today.toISOString().split("T")[0];

    const matchedPlatforms = [post.platform.toLowerCase()].filter((p) => Object.keys(PLATFORMS_CONFIG).includes(p));

    const newPost: Post = {
      id: generateId(),
      caption: post.caption,
      platforms: matchedPlatforms.length > 0 ? matchedPlatforms : planPlatforms,
      status: "draft",
      scheduledAt: targetDate,
      isCustomized: false,
      captions: {},
      media: null,
      publishedAt: null,
    };

    updatePostsInStorage([...posts, newPost]);
    triggerNotification(`Added post for Day ${post.day} to calendar.`, "success");
  };

  const addAllPlanPostsToCalendar = () => {
    const today = new Date();
    const newPosts: Post[] = generatedPlan.map((post) => {
      const postDate = new Date(today);
      postDate.setDate(postDate.getDate() + (post.day - 1));

      const matchedPlatforms = [post.platform.toLowerCase()].filter((p) => Object.keys(PLATFORMS_CONFIG).includes(p));

      return {
        id: generateId(),
        caption: post.caption,
        platforms: matchedPlatforms.length > 0 ? matchedPlatforms : planPlatforms,
        status: "draft",
        scheduledAt: postDate.toISOString().split("T")[0],
        isCustomized: false,
        captions: {},
        media: null,
        publishedAt: null,
      };
    });

    updatePostsInStorage([...posts, ...newPosts]);
    triggerNotification(`Added ${newPosts.length} posts to calendar.`, "success");
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-500" /> Plano AI Assistant
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ask questions, generate campaign ideas, refine captions, and brainstorm content plans instantly.
        </p>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setAssistantTab("chat")}
          className={`text-sm font-semibold transition ${
            assistantTab === "chat" ? "text-indigo-400 border-b-2 border-indigo-400 pb-2 -mb-[9px]" : "text-slate-500 hover:text-slate-300 pb-2 -mb-[9px]"
          }`}
        >
          AI Chat
        </button>
        <button
          onClick={() => setAssistantTab("plan")}
          className={`text-sm font-semibold transition ${
            assistantTab === "plan" ? "text-indigo-400 border-b-2 border-indigo-400 pb-2 -mb-[9px]" : "text-slate-500 hover:text-slate-300 pb-2 -mb-[9px]"
          }`}
        >
          Content Plan Generator
        </button>
      </div>

      {assistantTab === "chat" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch flex-1">
          {/* Quick Suggestions Left Column */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">AI Copy Prompts</span>
            {CHAT_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(sug.prompt)}
                className="w-full text-left p-4 bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 rounded-2xl text-xs font-medium text-slate-300 hover:text-indigo-400 transition hover:scale-[1.01] shadow-sm"
              >
                <span className="block font-bold text-white mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> {sug.label}
                </span>
                <span className="text-slate-500 line-clamp-2">{sug.prompt}</span>
              </button>
            ))}
          </div>

          {/* Chat Window Right Column */}
          <div className="md:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-xl">
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === "user" ? "bg-slate-800 text-indigo-400 border border-slate-700" : "bg-indigo-600 text-white"
                    }`}
                  >
                    {msg.role === "user" ? "U" : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-indigo-600/10 text-indigo-200 border border-indigo-500/20"
                        : "bg-slate-950 text-slate-300 border border-slate-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-3 self-start max-w-[85%]">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-xl text-xs bg-slate-950 text-slate-500 border border-slate-900 italic flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                    Plano AI is thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your copy questions or request post outlines..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isGenerating) handleSendChat();
                }}
                className="flex-1 p-2.5 bg-slate-950 rounded-lg text-xs text-slate-200 border border-slate-800 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-slate-700"
              />
              <button
                onClick={() => handleSendChat()}
                disabled={isGenerating || !chatInput.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {assistantTab === "plan" && (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400">Business Description</label>
                <textarea
                  value={planBusinessDesc}
                  onChange={(e) => setPlanBusinessDesc(e.target.value)}
                  placeholder="e.g. A premium coffee shop in Jakarta focusing on single-origin beans..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400">Target Audience</label>
                  <input
                    type="text"
                    value={planAudience}
                    onChange={(e) => setPlanAudience(e.target.value)}
                    placeholder="e.g. Millennials, coffee enthusiasts, young professionals"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400">Frequency</label>
                    <select
                      value={planFrequency}
                      onChange={(e) => setPlanFrequency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="3x/week">3x/week</option>
                      <option value="5x/week">5x/week</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400">Language</label>
                    <select
                      value={planLanguage}
                      onChange={(e) => setPlanLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="English">English</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400">Target Platforms</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(PLATFORMS_CONFIG).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      if (planPlatforms.includes(p)) {
                        setPlanPlatforms(planPlatforms.filter((pl) => pl !== p));
                      } else {
                        setPlanPlatforms([...planPlatforms, p]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                      planPlatforms.includes(p)
                        ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {getPlatformIcon(p)}
                    {PLATFORMS_CONFIG[p]?.name || p}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-xl transition flex items-center gap-2 w-full justify-center disabled:opacity-50"
              >
                {isGeneratingPlan ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGeneratingPlan ? "Generating Plan..." : "Generate 30-Day Content Plan"}
              </button>
            </div>
          </div>

          {generatedPlan.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-indigo-400" /> Generated Content Plan
                </h3>
                <button
                  onClick={addAllPlanPostsToCalendar}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition"
                >
                  Add all to Calendar
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Day / Date</th>
                      <th className="px-4 py-3">Platform</th>
                      <th className="px-4 py-3">Pillar</th>
                      <th className="px-4 py-3">Idea</th>
                      <th className="px-4 py-3">Caption Preview</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {generatedPlan.map((post, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-white">Day {post.day}</div>
                          <div className="text-xs text-slate-500">{post.date}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 bg-slate-800 rounded-md text-xs font-medium flex items-center gap-1 w-fit">
                            {getPlatformIcon(post.platform.toLowerCase())}
                            {post.platform}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-indigo-300">{post.contentPillar}</span>
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={post.postIdea}>
                          {post.postIdea}
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[300px] truncate text-slate-400" title={post.caption}>
                          {post.caption}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => addPlanPostToCalendar(post)}
                            className="p-1.5 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-400 rounded-lg transition"
                            title="Add to Calendar"
                          >
                            <PlusSquare className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
